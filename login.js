const request  = require('request');
const inquirer = require('inquirer');
const chalk    = require('chalk');

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

const login = (account) => {
    request.post({
        url: 'https://www.instagram.com/accounts/login/ajax/',
        form: {...account},
        headers: {
            'User-Agent': 'request',
            'Host': 'www.instagram.com',
            'X-CSRFToken': 'EJMrAsTOEi1SKiZLHzNf2RMBEZTQkI9I',
            'X-Instagram-AJAX': '1',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://www.instagram.com/',
            'Cookie': 'csrftoken=EJMrAsTOEi1SKiZLHzNf2RMBEZTQkI9I;'
        }
    },
    (err, resHeader, res) => {
        if (err) throw new Error(err);
        (JSON.parse(res).authenticated)
        ? console.log(chalk `{bold.green ${resHeader.headers['set-cookie'].join(';')}}`) 
        : console.log(chalk `{bold.red Wrong username/password!}`);
    });
}

console.log(chalk `
{bold.cyan +++ [Get Cookies Instagram] +++}`);

inquirer.prompt(user).then(account => login(account));
