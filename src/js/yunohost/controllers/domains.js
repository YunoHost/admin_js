(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    /**
     * Domains
     *
     */

    // List existing domains
    app.get('#/domains', function (c) {
        c.api('/domains', function(data) { // http://api.yunohost.org/#!/domain/domain_list_get_2
            c.api('/domains/main', function(data2) {
                domains = [];
                $.each(data.domains, function(k, domain) {
                    domains.push({
                        url: domain,
                        main: (domain == data2.current_main_domain) ? true : false
                    });
                });

                // Do not show main domain form if we have only 1 domain
                main_domain_form = (domains.length > 1) ? true: false;

                // Sort domains with main domain first
                domains.sort(function(a, b){ return -2*(a.main) + 1; });
                c.view('domain/domain_list', {domains: domains, main_domain_form: main_domain_form});
            }, 'PUT');
        });
    });

    // Add domain form
    app.get('#/domains/add', function (c) {
        $.get('https://dyndns.yunohost.org/domains', function() {})
            .done(function(data){
                c.params.ddomains = data.map(function(dom){return '.'+dom;});
            })
            .fail(function() {
                c.params.ddomains = ['.nohost.me', '.noho.st'];
            })
            .always(function() {
                data = {
                    ddomains : c.params.ddomains,
                    domains : c.params.domains,
                    allowDyndnsDomain : true
                };

                // Allow only 1 DynDns domain.
                var regex = data.ddomains.join('|');
                $.each(data.domains, function(k, domain) {
                    if ( domain.search(regex) > 0 ) {
                        data.allowDyndnsDomain = false;
                    }
                });

                c.view('domain/domain_add', data);
            });
    });

    // Add domain (POST)
    app.post('#/domains/add', function (c) {
        if (c.params['domain'] === '') {
            if (c.params['ddomain'] === '') {
                c.flash('fail', y18n.t('error_select_domain'));
                store.clear('slide');
                c.redirect('#/domains/add');
            }
            params = {'domain': c.params['ddomain'] + c.params['ddomain-ext']};
            endurl = 'dyndns';
        } else {
            params = { 'domain': c.params['domain'] };
            endurl = '';
        }

        c.api('/domains?'+endurl, function(data) { // http://api.yunohost.org/#!/domain/domain_add_post_1
            c.redirect('#/domains');
        }, 'POST', params);
    });

    // Get existing domain info
    app.get('#/domains/:domain', function (c) {
        c.api('/domains/main', function(dataMain) {
            c.api('/apps?installed', function(data) { // http://api.yunohost.org/#!/app/app_list_get_8

                enable_cert_management_ = true;
                $.each(data['apps'], function(k, v) {
                    if (v.id == "letsencrypt")
                    {
                        enable_cert_management_ = false;
                    }
                });


                domain = {
                    name: c.params['domain'],
                    main: (c.params['domain'] == dataMain.current_main_domain) ? true : false,
                    url: "https://"+c.params['domain'],
                    enable_cert_management: enable_cert_management_
                };
                console.log(domain);
                c.view('domain/domain_info', domain);
            });
        }, 'PUT');
    });

    // Domain DNS
    app.get('#/domains/:domain/dns', function (c) {
        c.api('/domains/' + c.params['domain'] + '/dns', function(data) {
            domain = {
                name: c.params['domain'],
                dns: data
            }
            c.view('domain/domain_dns', domain);
        });
    });

    // Domain certificate
    app.get('#/domains/:domain/cert-management', function (c) {
        c.api('/domains/cert-status/' + c.params['domain'] + '?full', function(data) {

            s = data["certificates"][c.params['domain']]
           
            status_ = {}
            status_.CA_type       = s.CA_type.verbose
            status_.CA_name       = s.CA_name
            status_.validity      = s.validity
            status_.ACME_eligible = s.ACME_eligible

            switch (s.summary.code) 
            {
                case "critical" :
                    status_.alert_type = "danger";
                    status_.alert_icon = "exclamation-circle" ;
                    status_.alert_message = y18n.t('certificate_alert_not_valid');
                    break;
                case "warning" :
                    status_.alert_type = "warning";
                    status_.alert_icon = "exclamation-triangle";
                    status_.alert_message = y18n.t('certificate_alert_selfsigned');
                    break;
                case "attention" :
                    if (status_.CA_type == "lets-encrypt")
                    {
                        status_.alert_type = "warning";
                        status_.alert_icon = "clock-o";
                        status_.alert_message = y18n.t('certificate_alert_letsencrypt_about_to_expire');
                    }
                    else 
                    {
                        status_.alert_type = "danger";
                        status_.alert_icon = "clock-o";
                        status_.alert_message = y18n.t('certificate_alert_about_to_expire');
                    }
                    break;
                case "good" :
                    status_.alert_type = "success";
                    status_.alert_icon = "check-circle";
                    status_.alert_message = y18n.t('certificate_alert_good');
                    break;
                case "great" :
                    status_.alert_type = "success";
                    status_.alert_icon = "thumbs-up";
                    status_.alert_message = y18n.t('certificate_alert_great');
                    break;
                default :
                    status_.alert_type = "warning"
                    status_.alert_icon = "question"
                    status_.alert_message = y18n.t('certificate_alert_unknown');
                    break;
            }

            actions_enabled = {};
            actions_enabled.install_letsencrypt = false;
            actions_enabled.manual_renew_letsencrpt = false;
            actions_enabled.regen_selfsigned = false;
            actions_enabled.replace_with_selfsigned = false;

            switch (s.CA_type.code) 
            {
                case "self-signed" :
                    actions_enabled.install_letsencrypt = true;
                    actions_enabled.regen_selfsigned = true;
                    break;
                case "lets-encrypt" :
                    actions_enabled.manual_renew_letsencrpt = true;
                    actions_enabled.replace_with_selfsigned = true;
                    break;
                default :
                    actions_enabled.replace_with_selfsigned = true;
                    break;
            }

            data_ = {
                name: c.params['domain'],
                status: status_,
                actions_enabled : actions_enabled
            };
            c.view('domain/domain_cert', data_);
        });
    });

    // Install let's encrypt certificate on domain
    app.get('#/domains/:domain/cert-install-LE', function (c) {
        c.confirm(
            y18n.t('certificate'),
            y18n.t('confirm_cert_install_LE', [c.params['domain']]),
            function(){
                c.api('/domains/cert-install/' + c.params['domain'], function(data) {
                    store.clear('slide');
                    c.redirect('#/domains/'+c.params['domain']+'/cert-management');
                }, 'POST');
            },
            function(){
                store.clear('slide');
                c.redirect('#/domains/'+c.params['domain']+'/cert-management');
            }
        );
    });

    // Regenerate a self-signed certificate
    app.get('#/domains/:domain/cert-regen-selfsigned', function (c) {
        c.confirm(
            y18n.t('certificate'),
            y18n.t('confirm_cert_regen_selfsigned', [c.params['domain']]),
            function(){
                c.api('/domains/cert-install/' + c.params['domain'] + "?self_signed", function(data) {
                    store.clear('slide');
                    c.redirect('#/domains/'+c.params['domain']+'/cert-management');
                }, 'POST');
            },
            function(){
                store.clear('slide');
                c.redirect('#/domains/'+c.params['domain']+'/cert-management');
            }
        );
    });

    // Manually renew a Let's Encrypt certificate
    app.get('#/domains/:domain/cert-renew-letsencrypt', function (c) {
        c.confirm(
            y18n.t('certificate'),
            y18n.t('confirm_cert_manual_renew_LE', [c.params['domain']]),
            function(){
                c.api('/domains/cert-renew/' + c.params['domain'] + "?force", function(data) {
                    store.clear('slide');
                    c.redirect('#/domains/'+c.params['domain']+'/cert-management');
                }, 'POST');
            },
            function(){
                store.clear('slide');
                c.redirect('#/domains/'+c.params['domain']+'/cert-management');
            }
        );
    });

    // Replace valid cert with self-signed
    app.get('#/domains/:domain/cert-replace-with-selfsigned', function (c) {
        c.confirm(
            y18n.t('certificate'),
            y18n.t('confirm_cert_revert_to_selfsigned', [c.params['domain']]),
            function(){
                c.api('/domains/cert-install/' + c.params['domain'] + "?self_signed&force", function(data) {
                    store.clear('slide');
                    c.redirect('#/domains/'+c.params['domain']+'/cert-management');
                }, 'POST');
            },
            function(){
                store.clear('slide');
                c.redirect('#/domains/'+c.params['domain']+'/cert-management');
            }
        );
    });


    // Remove existing domain
    app.get('#/domains/:domain/delete', function (c) {
        c.confirm(
            y18n.t('domains'),
            y18n.t('confirm_delete', [c.params['domain']]),
            function(){
                c.api('/domains/'+ c.params['domain'], function(data) { // http://api.yunohost.org/#!/domain/domain_remove_delete_3
                    store.clear('slide');
                    c.redirect('#/domains');
                }, 'DELETE');
            },
            function(){
                store.clear('slide');
                c.redirect('#/domains');
            }
        );
    });

    // Set default domain
    app.post('#/domains', function (c) {
        if (c.params['domain'] === '') {
            c.flash('fail', y18n.t('error_select_domain'));
            store.clear('slide');
            c.redirect('#/domains');
        } else {
            c.confirm(
                y18n.t('domains'),
                y18n.t('confirm_change_maindomain'),
                function(){
                    params = {'new_domain': c.params['domain']};
                    c.api('/domains/main', function(data) { // http://api.yunohost.org/#!/tools/tools_maindomain_put_1
                        store.clear('slide');
                        c.redirect('#/domains');
                    }, 'PUT', params);

                    // Wait 15s and refresh the page
                    refreshDomain = window.setTimeout(function(){
                        store.clear('slide');
                        c.redirect('#/domains');
                    }, 15000);
                },
                function(){
                    store.clear('slide');
                    c.redirect('#/domains');
                }
            );
        }
    });

})();
