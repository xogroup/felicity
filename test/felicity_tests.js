'use strict';

const Code = require('code');
const Felicity = require('../lib');
const Lab = require('lab');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

expect(Felicity.skeleton).to.exist();

describe('Felicity', () => {

    it('should fail when calling without proper schema', (done) => {

        expect(Felicity.skeleton).to.throw(Error, 'You must pass a valid schema to generate');
        done();
    });

    it('should return an empty object when schema is empty', (done) => {

        const schema = {};
        const felicitySkeleton = new Felicity.skeleton(schema);

        expect(felicitySkeleton).to.equal({});
        done();
    });
});
