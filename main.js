'use strict';

let rueckgabe = '';
let Link = '';
let Portionen = 3;
let mname = "";
let zubereitung = "";
let zutaten = "";
let zutatenjson = "";
let Ablage = "";

/*
 * Created with @iobroker/create-adapter v1.31.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
// const fs = require("fs");

var request = require("request");

/**
 * The adapter instance
 * @type {ioBroker.Adapter}
 */
let adapter;
const adapterName = require('./package.json').name.split('.').pop();

/**
 * Starts the adapter instance
 * @param {Partial<utils.AdapterOptions>} [options]
 */
function startAdapter(options) {
    /*    
        options = options || {};
        Object.assign(options, { name: adapterName });
    
        adapter = new utils.Adapter(options);
    */
    // Create the adapter and define its methods
    // @ts-ignore
    return adapter = utils.adapter(Object.assign({}, options, {
        name: adapterName,

        // The ready callback is called when databases are connected and adapter received configuration.
        // start here!
        ready: main, // Main method defined below for readability

        // is called when adapter shuts down - callback has to be called under any circumstances!
        unload: (callback) => {
            try {
                // Here you must clear all timeouts or intervals that may still be active
                // clearTimeout(timeout1);
                // clearTimeout(timeout2);
                // ...
                // clearInterval(interval1);

                callback();
            } catch (e) {
                callback();
            }
        },

        // If you need to react to object changes, uncomment the following method.
        // You also need to subscribe to the objects with `adapter.subscribeObjects`, similar to `adapter.subscribeStates`.
        objectChange: (id, obj) => {
            if (obj) {
                // The object was changed
                adapter.log.info(`--> object ${id} changed: ${JSON.stringify(obj)}`);
            } else {
                // The object was deleted
                adapter.log.info(`object ${id} deleted`);
            }
        }, 
        

        // is called if a subscribed state changes
        stateChange: (id, state) => {
            if (state) {
                // The state was changed
                adapter.log.debug(`Da hat sich was geändert ! state ${id} changed: ${state.val} (ack = ${state.ack})`);
                switch (id) {
                    case `${adapter.namespace}.SwitchDay`:
                        adapter.log.debug(`SwitchDay state ${id} changed: ${state.val} (ack = ${state.ack})`);
                        adapter.getState('Wochentag.' + state.val + '.Link', function (err, state) {
                            if (err) {
                                adapter.log.error(err);
                                return;
                            } else {
                                adapter.log.debug(
                                    'SwitchDay -> State ' + adapter.namespace + '.Wochentag.X.Link -' +
                                    '  Value: ' + state.val +
                                    ', ack: ' + state.ack +
                                    ', time stamp: ' + state.ts +
                                    ', last changed: ' + state.lc
                                );
                                adapter.setState('AktTag.Link', state.val);
                            }
                        });
                        adapter.getState('Wochentag.' + state.val + '.Name', function (err, state) {
                            if (err) {
                                adapter.log.error(err);
                                return;
                            } else {
                                adapter.log.debug(
                                    'State ' + adapter.namespace + '.Wochentag.X.Name -' +
                                    '  Value: ' + state.val +
                                    ', ack: ' + state.ack +
                                    ', time stamp: ' + state.ts +
                                    ', last changed: ' + state.lc
                                );
                                adapter.setState('AktTag.Name', state.val);
                            }
                        });
                        adapter.getState('Wochentag.' + state.val + '.Portionen', function (err, state) {
                            if (err) {
                                adapter.log.error(err);
                                return;
                            } else {
                                adapter.log.debug(
                                    'State ' + adapter.namespace + '.Wochentag.X.Portionen -' +
                                    '  Value: ' + state.val +
                                    ', ack: ' + state.ack +
                                    ', time stamp: ' + state.ts +
                                    ', last changed: ' + state.lc
                                );
                                adapter.setState('AktTag.Portionen', state.val);
                            }
                        });
                        adapter.getState('Wochentag.' + state.val + '.Zubereitung', function (err, state) {
                            if (err) {
                                adapter.log.error(err);
                                return;
                            } else {
                                adapter.log.debug(
                                    'State ' + adapter.namespace + '.Wochentag.X.Zubereitung -' +
                                    '  Value: ' + state.val +
                                    ', ack: ' + state.ack +
                                    ', time stamp: ' + state.ts +
                                    ', last changed: ' + state.lc
                                );
                                adapter.setState('AktTag.Zubereitung', state.val);
                            }
                        });
                        adapter.getState('Wochentag.' + state.val + '.Zutaten', function (err, state) {
                            if (err) {
                                adapter.log.error(err);
                                return;
                            } else {
                                adapter.log.debug(
                                    'State ' + adapter.namespace + '.Wochentag.X.Zutaten -' +
                                    '  Value: ' + state.val +
                                    ', ack: ' + state.ack +
                                    ', time stamp: ' + state.ts +
                                    ', last changed: ' + state.lc
                                );
                                adapter.setState('AktTag.Zutaten', state.val);
                            }
                        });
                        break;
                    case adapter.namespace + ".PlanSave":
                        adapter.log.debug(`PlanSave state ${id} changed: ${state.val} (ack = ${state.ack})`);
                        if (state.val) {
                            adapter.getState('SwitchDay', function (err, state) {
                                if (err) {
                                    adapter.log.error(err);
                                    return;
                                } else {
                                    adapter.log.debug(
                                        'PlanSave -> State ' + adapter.namespace + '.SwitchDay -' +
                                        '  Value: ' + state.val +
                                        ', ack: ' + state.ack +
                                        ', time stamp: ' + state.ts +
                                        ', last changed: ' + state.lc
                                    );
                                    rueckgabe = state.val
                                }
                            });
                            // Die Daten aus AktDat in den entsprechenden Wochentag unter Wochentag speichern
                            adapter.getState('AktTag.Link', function (err, state) {
                                if (err) {
                                    adapter.log.error(err);
                                    return;
                                } else {
                                    adapter.log.debug(
                                        'State ' + adapter.namespace + '.AktTag.Link -' +
                                        '  Value: ' + state.val +
                                        ', ack: ' + state.ack +
                                        ', time stamp: ' + state.ts +
                                        ', last changed: ' + state.lc
                                    );
                                    adapter.setState('Wochentag.' + rueckgabe + '.Link', state.val);
                                }
                            });
                            adapter.getState('AktTag.Name', function (err, state) {
                                if (err) {
                                    adapter.log.error(err);
                                    return;
                                } else {
                                    adapter.log.debug(
                                        'State ' + adapter.namespace + '.AktTag.Name -' +
                                        '  Value: ' + state.val +
                                        ', ack: ' + state.ack +
                                        ', time stamp: ' + state.ts +
                                        ', last changed: ' + state.lc
                                    );
                                    adapter.setState('Wochentag.' + rueckgabe + '.Name', state.val);
                                }
                            });
                            adapter.getState('AktTag.Portionen', function (err, state) {
                                if (err) {
                                    adapter.log.error(err);
                                    return;
                                } else {
                                    adapter.log.debug(
                                        'State ' + adapter.namespace + '.AktTag.Portionen -' +
                                        '  Value: ' + state.val +
                                        ', ack: ' + state.ack +
                                        ', time stamp: ' + state.ts +
                                        ', last changed: ' + state.lc
                                    );
                                    adapter.setState('Wochentag.' + rueckgabe + '.Portionen', state.val);
                                }
                            });
                            adapter.getState('AktTag.Zubereitung', function (err, state) {
                                if (err) {
                                    adapter.log.error(err);
                                    return;
                                } else {
                                    adapter.log.debug(
                                        'State ' + adapter.namespace + '.AktTag.Zubereitung -' +
                                        '  Value: ' + state.val +
                                        ', ack: ' + state.ack +
                                        ', time stamp: ' + state.ts +
                                        ', last changed: ' + state.lc
                                    );
                                    adapter.setState('Wochentag.' + rueckgabe + '.Zubereitung', state.val);
                                }
                            });
                            adapter.getState('AktTag.Zutaten', function (err, state) {
                                if (err) {
                                    adapter.log.error(err);
                                    return;
                                } else {
                                    adapter.log.debug(
                                        'State ' + adapter.namespace + '.AktTag.Zutaten -' +
                                        '  Value: ' + state.val +
                                        ', ack: ' + state.ack +
                                        ', time stamp: ' + state.ts +
                                        ', last changed: ' + state.lc
                                    );
                                    adapter.setState('Wochentag.' + rueckgabe + '.Zutaten', state.val);
                                }
                            });
                            adapter.setState('PlanSave', false);
                        }
                        break;
                    case adapter.namespace + ".AktTag.Link":
                        if (state.val != '') {
                            let Ablage = "AktTag."
                            GetDataChefkoch();
                        }
                        break;
                    case adapter.namespace + ".AktTag.Portionen":
                        if (state.val != '') {
                            let Ablage = "AktTag."
                            GetDataChefkoch();
                        }
                        break;
                    case adapter.namespace + ".Wochentag.0.Link":
                        if (state.val != '') {
                            let Ablage = "Wochentag.0."
                            adapter.log.debug("Wochentag hat sich der Link geändert! --> " + id);
                            GetDataChefkoch();
                        }
                        break;
                    }

            } else {
                // The state was deleted
                adapter.log.info(`state ${id} deleted`);
            }
        }

        // If you need to accept messages in your adapter, uncomment the following block.
        // /**
        //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
        //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
        //  */
        // message: (obj) => {
        //     if (typeof obj === 'object' && obj.message) {
        //         if (obj.command === 'send') {
        //             // e.g. send email or pushover or whatever
        //             adapter.log.info('send command');

        //             // Send response in callback if required
        //             if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
        //         }
        //     }
        // },
    }));
}

function GetDataChefkoch() {
    adapter.log.debug(`GetDataChefkoch`);
    adapter.getState(Ablage+'Link', function (err, state) {
        if (err) {
            adapter.log.error(err);
            return;
        } else {
            Link = state.val
            adapter.log.debug('--->'+Ablage+'Link (Link): '+Link);
            adapter.getState(Ablage+'Portionen', function (err, state) {
                if (err) {
                    adapter.log.error(err);
                    return;
                } else {
                    Portionen = state.val
                    if (Portionen === '' || Portionen == 0) {
                        Portionen = 3;
                        adapter.setState(Ablage+"Portionen", Portionen);
                    }
                    adapter.log.debug('--->'+Ablage+'Link und Portionen: '+Link+'   port: '+Portionen);
                    leseWebseite();
                    //adapter.setState('Wochentag.' + rueckgabe + '.Zutaten', state.val);
                }
            });
            //adapter.setState('Wochentag.' + rueckgabe + '.Zutaten', state.val);
        }
    });

    adapter.log.debug(`GetDataChefkoch Daten: `+Link+' --- '+Portionen);
}

function leseWebseite () {
    adapter.log.debug('--->leseWebseite: '+Link+'   port: '+Portionen);    
    try {
        request(Link, function (error, response, body) {
            if (!error && response.statusCode == 200) {              // kein Fehler, Inhalt in body
                findeRezeptName(body);
                findeZubereitung(body);
                findeZutaten(body);
            } else adapter.log.error(error,'error');                               // Error beim Einlesen
        });
    } catch (e) {
        adapter.log.error('Fehler (try) leseWebseite: ' + e, 'error');
    }
    adapter.log.debug('Stop leseWebseite');
}

function findeZubereitung (body) {

    adapter.log.debug('Start findeZubereitung');
    //Beschreibung der Zubereitung finden und vom HTML code befreien
    var index1 = body.indexOf('>Zubereitung</h2>');
    var text1 = body.slice(index1);
    var index2 = text1.indexOf('</div>');
    text1 = text1.slice(0, index2);
    text1 = text1.replace('<h2>Zubereitung</h2>', "");
    text1 = text1.replace(/[ ]{2,}/g, "");
    text1 = text1.replace(/\n/g, "");
    text1 = text1.replace(/<br\/>/g, "");
    text1 = text1.replace(/\t/g, "");
    text1 = text1.replace(//g, "\n");
    //text1 = text1.replace(/<br>/g, "\n");
    text1 = text1.replace(/<div class="ds-box">/g,"|br|");
    text1 = text1.replace(/<[^>]*>/g, "");
    text1 = text1.replace(/\|br\|/g,"<br>");
    //text1 = text1.replace(/\s\s*/g, " ");
    text1 = text1.replace(/\n/g, "<br>");
    try{text1 = text1.replace(/\"/g, "");} catch(err){}

    adapter.log.debug(Ablage+'Zubereitung: ' + text1);
    adapter.setState(Ablage+"Zubereitung", text1);
    adapter.log.debug('Stop findeZubereitung');
}

function findeZutaten (body) {

    adapter.log.debug('Start findeZutaten');
    //Zutaten liste vom HTML Code befreien
    var index1 = body.indexOf('<table class="ingredients table-header"');
    var text1 = body.slice(index1);
//    var index2 = text1.indexOf('</table>');
    var index2 = text1.indexOf('<div class="pi-cont">');

    text1 = text1.slice(0, index2);
    text1 = text1.replace(/<h3>/g, "---");
    text1 = text1.replace(/<\/h3>/g, "!!!");
    text1 = text1.replace(/<td.*>/g, " ");
    text1 = text1.replace(/<tr>/g, " - ");
    text1 = text1.replace(/\s<\/tr>/g, "; ");
    text1 = text1.replace(/<a[^>]*>/, " ");
    text1 = text1.replace(/<[^>]*>/g, "");
    text1 = text1.replace(/\t/g, "");
    text1 = text1.replace(/\n/g, "");
    text1 = text1.replace(/;/g, "\n");
    text1 = text1.replace(/\s\s;/g, "");
    text1 = text1.replace(/ ;/g, ";");
    text1 = text1.replace(/ /g, " ");
    text1 = text1.replace(/\&nbsp;/g, " ");
    text1 = text1.replace(/[ ]{2,}/g, " ");
    text1 = text1.replace(/\n/g, "<br>");
    text1 = text1.replace(/- ---/g, "<h4>");
    text1 = text1.replace(/!!!/g, "</h4>");

    //Anzahl der Portionen ermitteln
    //var text2 = new RegExp(/<input aria-label="Anzahl der Portionen".*value="(.*)".*/);
    var index1 = body.indexOf('<input aria-label="Anzahl der Portionen"');
    var text2 = body.slice(index1);
    var index2 = text2.indexOf('">');
    text2 = text2.slice(0, index2);
    //text2 = text2.exec(body);
    text2 = text2.toString();
    text2 = text2.replace(/.*value="/ , "");

    var anzahlPortionen = text2;

    adapter.log.debug('AktTag.Zutaten: ' + text1);
    zutaten = text1;
    text1 = text1.replace(/- /g , "\[\{\"zutat\"\:\"");
    text1 = text1.replace(/ <br> /g , "\"\},");
    text1 = text1.replace(/.$/ , "\]");
    zutatenjson = text1;
    adapter.log.debug('Zutaten: '+zutaten);
    adapter.log.debug('Zutaten Json: '+zutatenjson);
    adapter.setState(Ablage+"Zutaten", zutaten);
    adapter.setState(Ablage+"ZutatenJson", zutatenjson);
    adapter.log.debug('Stop findeZutaten');
}

function findeRezeptName (body) {

    adapter.log.debug('Start findeRezeptName');
    var text1 = new RegExp('<h1 class="">.*</h1>');
    text1 = text1.exec(body);
    text1 = text1.toString();
    //text1 = text1.replace('<h1 class="page-title">', "");
    text1 = text1.replace(/<[^>]*>/g, "");
    try{text1 = text1.replace('</h1>', "");}catch(err){}
    try{text1 = text1.replace(/&Auml;/g, "Ä");}catch(err){}
    try{text1 = text1.replace(/&auml;/g, "ä");}catch(err){}
    try{text1 = text1.replace(/&Ouml;/g, "Ö");}catch(err){}
    try{text1 = text1.replace(/&ouml;/g, "ö");}catch(err){}
    try{text1 = text1.replace(/&Uuml;/g, "Ü");}catch(err){}
    try{text1 = text1.replace(/&uuml;/g, "ü");}catch(err){}
    try{text1 = text1.replace(/&szlig;/g, "ß");}catch(err){}
    try{text1 = text1.replace(/\'/g, "");}catch(err){}

    adapter.setState(Ablage+"Name", text1);
    adapter.log.debug('Stop findeRezeptName');
}


async function main() {

    //adapter.log.info('Hallo Welt! Mein erster ioBroker-Adapter meldet sich hier :-)');

    // The adapters config (in the instance object everything under the attribute "native") is accessible via
    // adapter.config:
    adapter.log.debug('config WithChefkoch: ' + adapter.config.WithChefkoch);
    adapter.log.debug('config WithShoppingList: ' + adapter.config.WithShoppingList);
    adapter.log.debug('config WithAlexa: ' + adapter.config.WithAlexa);
    adapter.log.debug('config WithSpeak: ' + adapter.config.WithSpeak);
    adapter.log.debug('config AlexaDevice: ' + adapter.config.AlexaDevice);


    // In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
    //adapter.subscribeStates('testVariable');
    // You can also add a subscription for multiple states. The following line watches all states starting with "lights."
    // adapter.subscribeStates('lights.*');
    // Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
    //adapter.subscribeStates('*');
    adapter.subscribeStates('AktTag.*');
    adapter.subscribeStates('PlanSave');
    adapter.subscribeStates('SwitchDay');
    adapter.subscribeStates('Wochentag.*.Link');

    //    setState examples
    //    you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)

    // the variable testVariable is set to true as command (ack=false)
    //await adapter.setStateAsync('testVariable', true);
    await adapter.setStateAsync('SwitchDay', 1);

    // same thing, but the value is flagged "ack"
    // ack should be always set to true if the value is received from or acknowledged from the target system
    //await adapter.setStateAsync('testVariable', { val: true, ack: true });

    // same thing, but the state is deleted after 30s (getState will return null afterwards)
    //await adapter.setStateAsync('testVariable', { val: true, ack: true, expire: 30 });

    // examples for the checkPassword/checkGroup functions
    adapter.checkPassword('admin', 'iobroker', (res) => {
        adapter.log.info('check user admin pw iobroker: ' + res);
    });

    adapter.checkGroup('admin', 'admin', (res) => {
        adapter.log.info('check group user admin group admin: ' + res);
    });
}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export startAdapter in compact mode
    module.exports = startAdapter;
} else {
    // otherwise start the instance directly
    startAdapter();
}