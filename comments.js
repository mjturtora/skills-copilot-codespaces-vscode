// Create web server
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var db = require('./lib/db.js');
var shortid = require('shortid');
var cookie = require('cookie');
var Cookies = require('cookies');

var app = http.createServer(function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    var cookies = new Cookies(request, response);
    var isOwner = false;

    var title = queryData.id;
    var description = queryData.id;

    if (pathname === '/'){
        if (cookies.get('session_id') && db.get('session', cookies.get('session_id'))){
            isOwner = true;
        }

        db.get('topic', title, function(topic){
            var list = template.list(db.get('topic'));
            var html = template.HTML(title, list,
                `
                <h2>${sanitizeHtml(title)}</h2>
                <p>${sanitizeHtml(description)}</p>
                <p>by ${sanitizeHtml(topic.author)}</p>
                `,
                `
                <a href="/create">create</a>
                <a href="/update?id=${title}">update</a>
                <form action="/delete_process" method="post">
                    <input type="hidden" name="id" value="${title}">
                    <input type="submit" value="delete">
                </form>
                `,
                isOwner
            );
            response.writeHead(200);
            response.end(html);
        });
    } else if (pathname === '/create'){
        if (cookies.get('session_id') && db.get('session', cookies.get('session_id'))){
            isOwner = true;
        }

        db.get('topic', title, function(topic){
            var list = template.list(db.get('topic'));
            var html = template.HTML('WEB - create', list,
                `
                <form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p><textarea name="description" placeholder="description"></textarea></p>
                    <p><input type="submit"></p>
