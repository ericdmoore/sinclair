const a = require('asd'); // Default
const {a1, ...b1} = require('asd1'); // ObjectPattern -> import * as asd1_mod from 'asd1'; const {a1, ...b1} = asd1_mod;
const myA2 = require('asd2').key1; // Var Assignment of connected Property
const {a3} = require('asd3').key2; // ObjPattern Assignment of Connected Property
const myA4 = require('asd4')('SomeParam');
const {myA5} = require('asd5')('SomeParam').key3; // Object Pattern Assigment From Implied Function and Key DeReference
