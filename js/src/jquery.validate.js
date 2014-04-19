/*! 
 * This is a jquery plugin for form validate
 * Author:Shifone
 * Website:http://www.cuishifeng.cn
 * Version:1.0.0 
 * Date:2014-04-19 
 * License:http://www.apache.org/licenses/LICENSE-2.0 
 */
;(function($) {

    $.fn.extend({
        validate: function(options) {
            var defaults = {
                //the class will add while field validate error
                err_class: "error",
                //error msg to override default error msg
                messages: {},
                //there is user custom deal error callback
                show_error: null,
                //if show error is not null, it will use this function to clear error
                clear_error: null
            };
            options = $.extend({}, defaults, options);

            var messages = $.extend({}, getMessages(), options.messages);

            var _self = this;

            clearError();

            var errors = {};

            //serialize fields from form ,only has value
            var fields = this.serializeArray();
            //get all fields name from form
            var all_fields_name = _self.find(':input[name]').map(function() {
                return this.name;
            }).get();

            var methods = getMethods();

            //parse all allow rules
            var allowed_rules = [];
            $.each(methods, function(k, v) {
                allowed_rules.push(k);
            });

            $.each(options.rules, function(field_name, rules) {
                var field = null;

                //match field 
                $.each(fields, function(k, v) {
                    if (v.name === field_name) {
                        field = v;
                        return false;
                    }
                });

                //if no match from serialize,this is two reason:mispelled field name in the rules or the field is not a successful control
                if (field === null) {
                    if ($.inArray(field_name, all_fields_name) !== -1) {
                        field = {
                            name: field_name,
                            value: getFieldValue(field_name)
                        };
                    }
                }

                if (field !== null) {
                    $.each(rules, function(rule_idx, rule_value) {

                        $.each(rule_value, function(k, v) {
                            if (k === "key") {
                                if ($.inArray(v, allowed_rules) !== -1) {
                                    if (methods[v].call(_self, field.name, field.value, rule_value.args) !== true) {
                                        errors[field.name] = formatError(field.name, v, rule_value);
                                    }
                                }
                            }
                        });

                    });
                }
            });


            if (!$.isEmptyObject(errors)) {
                if ($.isFunction(options.show_error)) {
                    options.show_error.call(this, errors);
                } else {
                    showError();
                }

                return false;
            } else {
                return true;
            }


            function clearError() {
                if (options.show_error === null) {
                    //default clear
                    _self.find("." + options.err_class).html('');
                } else if (options.show_error !== null && $.isFunction(options.clear_error)) {
                    //clear error custom
                    options.clear_error.call(_self);
                } else {
                    throw new Error("Not hava clear error function");
                }
            }


            function formatError(field_name, rule_type, rule_value) {
                var err_msg = messages[rule_type];
                if (rule_value.message) {
                    err_msg = rule_value.message;//["message"];
                }

                if (rule_value.args) {
                    err_msg = err_msg.replace(new RegExp(':value', 'ig'), rule_value.args);
                }

                return errors[field_name] ? errors[field_name] + "," + err_msg : err_msg;
            }


            function showError() {
                $.each(errors, function(field_name, msg) {
                    var _parent = _self.find('[name="' + field_name + '"]').parent();
                    var _err_span = _parent.find("." + options.err_class);
                    if (_err_span.length > 0) {
                        _err_span.html(msg);
                    } else {
                        $('<span>' + msg + '</span>').addClass(options.err_class).appendTo(_parent);
                    }

                });
            }



            function getFieldValue(field_name) {
                var $input = _self.find('[name="' + field_name + '"]');
                if ($input.is('[type="checkbox"], [type="radio"]')) {
                    return $input.is(':checked') ? $input.val() : null;
                } else {
                    return $input.val();
                }
            }

            function getMessages() {
                return {
                    not_empty: 'This field is required.',
                    mobile: 'Please enter a valid mobile number',
                    min_length: 'Please enter at least :value characters.',
                    max_length: 'Please enter no more than :value characters.',
                    regex: '',
                    email: 'Please enter a valid email address.',
                    url: 'Please enter a valid URL.',
                    exact_length: 'Please enter exactly :value characters.',
                    equals: '',
                    ip: '',
                    credit_card: 'Please enter a valid credit card number.',
                    alpha: '',
                    alpha_numeric: '',
                    alpha_dash: '',
                    digit: 'Please enter only digits.',
                    numeric: 'Please enter a valid number.',
                    decimal: 'Please enter a decimal number.',
                    matches: 'Must match the previous value.'
                };
            }

            function getMethods() {
                return {
                    not_empty: function(field, value) {
                        return value !== null && $.trim(value).length > 0;
                    },

                    mobile: function(field, value) {
                        var regex = /^(13[0-9]|15[0|3|6|7|8|9]|18[0|6|8|9])\d{8}$/;
                        return regex.test($.trim(value));
                    },

                    min_length: function(field, value, min_len) {
                        var length = $.trim(value).length,
                            result = (length >= min_len);
                        return result;
                    },

                    max_length: function(field, value, max_len) {
                        return $.trim(value).length <= max_len;
                    },

                    regex: function(field, value, regexp) {
                        var myregex = new RegExp(regexp);
                        return myregex.test(value);
                    },

                    email: function(field, value) {
                        // by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
                        var regex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
                        return regex.test($.trim(value));
                    },

                    url: function(field, value) {
                        // by Scott Gonzalez: http://projects.scottsplayground.com/iri/
                        var regex = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
                        return regex.test(value);
                    },

                    exact_length: function(field, value, exact_length) {
                        var length = $.trim(value).length,
                            result = (length === exact_length);
                        return result;
                    },

                    equals: function(field, value, target) {
                        return value === target;
                    },

                    ip: function(field, value) {
                        var regex = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i;
                        return regex.test($.trim(value));
                    },

                    credit_card: function(field, value) {
                        // accept only spaces, digits and dashes
                        if (/[^0-9 \-]+/.test(value)) {
                            return false;
                        }
                        var nCheck = 0,
                            nDigit = 0,
                            bEven = false;

                        value = value.replace(/\D/g, "");

                        for (var n = value.length - 1; n >= 0; n--) {
                            var cDigit = value.charAt(n);
                            nDigit = parseInt(cDigit, 10);
                            if (bEven) {
                                if ((nDigit *= 2) > 9) {
                                    nDigit -= 9;
                                }
                            }
                            nCheck += nDigit;
                            bEven = !bEven;
                        }

                        return (nCheck % 10) === 0;
                    },

                    alpha: function(field, value) {
                        var regex = /^[a-z]*$/i;
                        return regex.test(value);
                    },

                    alpha_numeric: function(field, value) {
                        var regex = /^[a-z0-9]*$/i;
                        return regex.test(value);
                    },

                    alpha_dash: function(field, value) {
                        var regex = /^[a-z0-9_\-]*$/i;
                        return regex.test(value);
                    },

                    digit: function(field, value) {
                        var regex = /^\d*$/;
                        return regex.test(value);
                    },

                    numeric: function(field, value) {
                        var regex = /^([\+\-]?[0-9]+(\.[0-9]+)?)?$/;
                        return regex.test(value);
                    },

                    // same as numeric
                    decimal: function(field, value) {
                        var regex = /^([\+\-]?[0-9]+(\.[0-9]+)?)?$/;
                        return regex.test(value);
                    },

                    matches: function(field, value, param) {
                        return value === _self.find('[name="' + param + '"]').val();
                    }
                };
            }
        }
    });

})(jQuery);