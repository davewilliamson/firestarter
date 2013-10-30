var buster = require('buster'),
    deepString = 'isHere',
    tarray = [1, 2, 3, 4, 5],
    newtarray = [6, 7, 8, 9, 0],
    testString = 'XXXXX',
    dummySiteConfig = {
        tdd: true,
        one: {
            isHere: 'l1',
            two: {
                isHere: 'l2',
                three: {
                    isHere: deepString
                }
            },
            testArray: tarray
        }
    };

buster.testCase('Test CONFIG', {

    'Test RAW config': function(done) {
        'use strict';
        var config = require('../lib/configTool')({}, dummySiteConfig);
        assert(config.tdd);
        assert.isArray(config.one.testArray);
        assert.same(config.one.testArray, tarray);
        done();
    },

    'Test MODIFIED config': function(done) {
        'use strict';

        var config = new require('../lib/configTool')({
            tdd: testString,
            one: {
                two: {
                    newValue: true
                },
                twodeep: deepString,
                testArray: newtarray
            },
            outerFour: true
        }, dummySiteConfig);
        assert.same(config.tdd, testString);
        assert(config.one.two.newValue);
        assert.same(config.one.two.three.isHere, deepString);
        assert.same(config.one.twodeep, deepString);
        assert(config.outerFour);
        assert.isArray(config.one.testArray);
        assert(config.one.testArray[2] === newtarray[2]);
        done();
    },

    'Test MODIFIED config (without updating)': function(done) {
        'use strict';

        var config = new require('../lib/configTool')(null, dummySiteConfig);
        assert.same(config.tdd, testString);
        assert(config.one.two.newValue);
        assert.same(config.one.two.three.isHere, deepString);
        assert.same(config.one.twodeep, deepString);
        assert(config.outerFour);
        assert.isArray(config.one.testArray);
        assert(config.one.testArray[2] === newtarray[2]);
        done();
    },

    'Test REAL config setup': function(done) {
        'use strict';

        var config = new require('../lib/configTool')({
            tddTest: true
        });
        assert(config.tddTest);
        done();
    }
});
