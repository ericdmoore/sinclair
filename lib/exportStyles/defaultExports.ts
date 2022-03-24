/**
  * Exports = {} object
  * export.Name = Name --> export const Name
  *
*/

import type {Node as estNode} from 'estree';
import type {PromiseOr} from '../types';
import {JSish} from '../createQuerySelector';

const selectorObj = {};
export const selector = {
	o: selectorObj,
	s: '',
};

export const find = async (_selector:string | JSish): Promise<estNode[]> => [];

/**
  * Per node
  */
export const alter = async (ast :PromiseOr<estNode>):Promise<estNode> => ast;

export const apply = (_selector:string | JSish) => async (ast :PromiseOr<estNode>) : Promise<estNode> => ast;
