'use strict';

import * as fs from 'fs-extra';
import * as path from 'path';

import { Server } from './server';
import * as Errors from './server-errors';
import * as Return from './server-return';

export * from './decorators';
export * from './server-types';
export * from './server';
export * from './passport-authenticator';

export { Return };
export { Errors };
export { DefaultServiceFactory } from './server-container';

const CONFIG_FILE = searchConfigFile();
if (CONFIG_FILE && fs.existsSync(CONFIG_FILE)) {
    const config = fs.readJSONSync(CONFIG_FILE);
    if (config.useIoC) {
        Server.useIoC(config.es6);
    } else if (config.serviceFactory) {
        if (config.serviceFactory.indexOf('.') === 0) {
            config.serviceFactory = path.join(process.cwd(), config.serviceFactory);
        }
        const serviceFactory = require(config.serviceFactory);
        Server.registerServiceFactory(serviceFactory);
    }
}

function searchConfigFile() {
    let configFile = path.join(__dirname, 'rest.config');
    while (!fs.existsSync(configFile)) {
        const fileOnParent = path.normalize(path.join(path.dirname(configFile), '..', 'rest.config'));
        if (configFile === fileOnParent) {
            return null;
        }
        configFile = fileOnParent;
    }
    return configFile;
}
