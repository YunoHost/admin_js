(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    /**
     * Users
     *
     */

    // List existing users
    app.get('#/users', function (c) {
        c.api('/users', function(data) { // http://api.yunohost.org/#!/user/user_list_get_3
            c.view('user/user_list', data);
        });
    });

    // Create user form
    app.get('#/users/create', function (c) {
        c.api('/domains', function(data) { // http://api.yunohost.org/#!/domain/domain_list_get_2
            c.view('user/user_create', data);
        });
    });

    // Create user (POST)
    app.post('#/users/create', function (c) {
        if (c.params['password'] == c.params['confirmation']) {
            if (c.params['password'].length < 4) {
                c.flash('fail', y18n.t('password_too_short'));
                store.clear('slide');
            }
            else {
                c.params['mail'] = c.params['email'] + c.params['domain'];
                c.api('/users', function(data) { // http://api.yunohost.org/#!/user/user_create_post_2
                    c.redirect('#/users');
                }, 'POST', c.params.toHash());
            }
        } else {
            c.flash('fail', y18n.t('passwords_dont_match'));
            store.clear('slide');
            //c.redirect('#/users/create');
        }
    });

    // Show user information
    app.get('#/users/:user', function (c) {
        c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_info_get_0
            c.view('user/user_info', data);
        });
    });

    // Edit user form
    app.get('#/users/:user/edit', function (c) {
        c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_info_get_0
            c.api('/domains', function(dataDomains) { // http://api.yunohost.org/#!/domain/domain_list_get_2

                // User email use a fake splitted field
                email = data.mail.split('@');
                data.email = {
                    username : email[0],
                    domain : email[1]
                };

                // Domains
                data.domains = [];
                $.each(dataDomains.domains, function(key, value) {
                    data.domains.push({
                        domain: value,
                        selected: (value == data.email.domain) ? true : false
                    });
                });

                c.view('user/user_edit', data);
            });
        });
    });

    // Update user information
    app.put('#/users/:user', function (c) {
        // Get full user object
        c.api('/users/'+ c.params['user'], function(user) {

            // concat email/domain pseudo field
            if (c.params['mail'] !== c.params['email'] + c.params['domain']) {
                c.params['mail'] = c.params['email'] + c.params['domain'];
            }
            else {
                c.params['mail'] = '';
            }
            // Clear temporary inputs
            c.params['email'] = c.params['domain'] = '';


            // force array type for mail aliases and redirections
            if (typeof c.params['mailalias'] == 'string') {c.params['mailalias'] = [c.params['mailalias']];}
            if (typeof c.params['mailforward'] == 'string') {c.params['mailforward'] = [c.params['mailforward']];}

            // Check for added/removed aliases and redirections
            c.params['add_mailalias'] = c.arrayDiff(c.params['mailalias'], user['mail-aliases']);
            c.params['remove_mailalias'] = c.arrayDiff(user['mail-aliases'], c.params['mailalias']);
            c.params['add_mailforward'] = c.arrayDiff(c.params['mailforward'], user['mail-forward']);
            c.params['remove_mailforward'] = c.arrayDiff(user['mail-forward'], c.params['mailforward']);

            // Clear temporary inputs
            c.params['mailalias'] = c.params['mailforward'] = '';

            // Remove empty inputs
            params = {};
            $.each(c.params.toHash(), function(key, value) {
                if (value.length > 0 && key !== 'user') { params[key] = value; }
            });

            if ($.isEmptyObject(params)) {
                c.flash('fail', y18n.t('error_modify_something'));
                store.clear('slide');
                c.redirect('#/users/'+ c.params['user'] + '/edit');
            } else {
                if (params['password']) {
                    if (params['password'] == params['confirmation']) {
                        if (params['password'].length < 4) {
                            c.flash('fail', y18n.t('password_too_short'));
                            store.clear('slide');
                            c.redirect('#/users/'+ c.params['user'] + '/edit');
                        }
                        else {
                            params['change_password'] = params['password'];
                            c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_update_put_1
                                c.redirect('#/users/'+ c.params['user']);
                            }, 'PUT', params);
                        }
                    } else {
                        c.flash('fail', y18n.t('passwords_dont_match'));
                        store.clear('slide');
                        c.redirect('#/users/'+ c.params['user'] + '/edit');
                    }
                }
                else {
                    c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_update_put_1
                        c.redirect('#/users/'+ c.params['user']);
                    }, 'PUT', params);
                }
            }
        }, 'GET');
    });

    // Remove existing user
    app.get('#/users/:user/delete', function (c) {
        c.confirm(
            y18n.t('users'),
            y18n.t('confirm_delete', [c.params['user']]),
            function(){
                c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_delete_delete_4
                    c.redirect('#/users');
                }, 'DELETE');
            },
            function(){
                store.clear('slide');
                c.redirect('#/users/'+ c.params['user']);
            }
        );
    });

})();