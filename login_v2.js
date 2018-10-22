const request  = require('request');
const inquirer = require('inquirer');
const chalk    = require('chalk');
const md5      = require('js-md5');
const _        = require('lodash');
const hmac     = require('crypto-js/hmac-sha256');

const user = [{
        type: 'input',
        name: 'username',
        message: '[>] Username:',
        validate: (value) => {
            if (!value) return 'Can\'t Empty';
            return true;
        }
    },
    {
        type: 'password',
        name: 'password',
        message: '[>] Password:',
        mask: '*',
        validate: (value) => {
            if (!value) return 'Can\'t Empty';
            return true;
        }
    }
];

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toLowerCase();
}

const generateDeviceId = () => {
    return `android-${md5(_.random(9999))}${_.random(9)}`;
}

const generateSignature = (body) => {
    let hash = hmac(body, '109513c04303341a7daf27bb41b268e633b30dcc65a3fe14503f743176113869');
    return `${hash}.${body}`;
}

const login = (signedBody) => {
    request({
        url: 'https://i.instagram.com/api/v1/accounts/login/',
        method: 'POST',
        form: {ig_sig_key_version: 4, signed_body: signedBody},
        headers: { 'User-Agent': 'Instagram 27.0.0.7.97 Android (18/4.3; 320dpi; 720x1280; Xiaomi; HM 1SW; armani; qcom; en_US)' }
    },
    (err, resHeader, res) => {
        if (err) throw new Error(err);
        (JSON.parse(res).status === 'ok')
        ? console.log(chalk `{bold.green ${resHeader.headers['set-cookie'].join(';')}}`) 
        : console.log(chalk `{bold.red ${res}}`);
    });
}

console.log(chalk `
{bold.cyan +++ [Get Cookies Instagram] +++}`);

inquirer.prompt(user).then(account => {
    let data = {
        username: account.username,
        password: account.password,
        _csrftoken: "missing",
        _uuid: generateUUID(),
        device_id: generateDeviceId(),
        login_attempt_count: 0
    };
    let signedBody = generateSignature(JSON.stringify(data));
    login(signedBody);   
});