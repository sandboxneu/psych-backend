const express = require('express');
const fileUpload = require('express-fileupload');
const request = require('supertest');
const fse = require('fs-extra');
require('dotenv').config();

process.env.FILEDIR = `${process.env.FILEDIR}/test`;
const TESTDIR = process.env.FILEDIR;
const experiment = require('./experiment');

afterEach(() => {
  fse.emptyDirSync(TESTDIR);
  fse.ensureDirSync(`${TESTDIR}/data`);
});

afterAll(() => {
  fse.remove(TESTDIR);
});

const app = express();
app.use(fileUpload());
app.use(experiment());

test('GET experiment config should fail if no config', async () => {
  await request(app)
    .get('/')
    .expect(400);
});

test('GET experiment config should return uploaded config', async () => {
  await request(app)
    .post('/')
    .attach('file', Buffer.from('heyheyhey'))
    .expect(200);
  await request(app)
    .get('/')
    .expect(200, 'heyheyhey');
});

test('POST experiment config twice should overwrite', async () => {
  await request(app)
    .post('/')
    .attach('file', Buffer.from('heyheyhey'))
    .expect(200);
  await request(app)
    .post('/')
    .attach('file', Buffer.from('NEW CONFIG'))
    .expect(200);
  await request(app)
    .get('/')
    .expect(200, 'NEW CONFIG');
});

test('POST experiment config with file should succeed', async () => {
  await request(app)
    .post('/')
    .attach('file', Buffer.from('heyheyhey'))
    .expect(200);
});

test('POST experiment config without file should fail', async () => {
  await request(app)
    .post('/')
    .expect(400);
});

test('POST experiment config with wrong field name should fail', async () => {
  await request(app)
    .post('/')
    .attach('WRONG', Buffer.from('heyheyhey'))
    .expect(400);
});
