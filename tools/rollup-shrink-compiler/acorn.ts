/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Program,
  BaseNode,
  Identifier,
  ImportDeclaration,
  VariableDeclarator,
  BlockStatement,
  ExportNamedDeclaration,
  ExportDefaultDeclaration,
  ExportAllDeclaration,
  FunctionDeclaration,
  VariableDeclaration,
  ClassDeclaration,
  ExportSpecifier,
  Property,
  Node,
} from "estree";
import type acornWalkType from "acorn-walk";
import { writeTempFile } from "./temp-file";
import { log } from "./debug";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const acornWalk = require("acorn-walk");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const acorn = require("acorn");
// import * as acornWalk from "acorn-walk";

// TODO: add type map for visitors
// type SimpleWalkerFn<TState, TNode = acorn.Node> = (
//   node: TNode,
//   visitors: SimpleVisitors<TState>,
//   base?: acornWalkType.RecursiveVisitors<TState>,
//   state?: TState
// ) => void;

// type AncestorWalkerFn<TState, TNode = acorn.Node> = (
//   node: TNode,
//   visitors: acornWalkType.AncestorVisitors<TState>,
//   base?: acornWalkType.RecursiveVisitors<TState>,
//   state?: TState
// ) => void;

// type RecursiveWalkerFn<TState, TNode = acorn.Node> = (
//   node: TNode,
//   visitors: acornWalkType.AncestorVisitors<TState>,
//   base?: acornWalkType.RecursiveVisitors<TState>,
//   state?: TState
// ) => void;

// type SimpleVisitors<TState> = {
//   [type: string]: SimpleWalkerFn<TState>;
// };

// type RecursiveVisitors<TState> = {
//   [type: string]: RecursiveWalkerFn<TState>;
// };

// export const walk: {
//   simple: <TState = unknown, TNode = acorn.Node>(
//     ...args: Parameters<SimpleWalkerFn<TState, TNode>>
//   ) => void;
//   ancestor: <TState = unknown, TNode = acorn.Node>(
//     ...args: Parameters<AncestorWalkerFn<TState, TNode>>
//   ) => void;
// } = {
//   simple: acornWalk.simple,
//   ancestor: acornWalk.ancestor,
// };

export const walk: {
  simple<TState>(
    node: Node,
    visitors: acornWalkType.SimpleVisitors<TState>,
    base?: acornWalkType.RecursiveVisitors<TState>,
    state?: TState
  ): void;
  ancestor<TState>(
    node: Node,
    visitors: acornWalkType.AncestorVisitors<TState>,
    base?: acornWalkType.RecursiveVisitors<TState>,
    state?: TState
  ): void;
} = {
  simple: acornWalk.simple,
  ancestor: acornWalk.ancestor,
};

const DEFAULT_ACORN_OPTIONS = {
  ecmaVersion: 2020 as any,
  sourceType: "module" as any,
  preserveParens: false,
  ranges: true,
};

export async function parse(fileName: string, source: string): Promise<Node> {
  // eslint-disable-next-line no-useless-catch
  try {
    return acorn.parse(source, DEFAULT_ACORN_OPTIONS);
  } catch (e) {
    log(
      `parse exception in ${fileName}`,
      `file://${await writeTempFile(source, ".js")}`
    );
    throw e;
  }
}

export function isIdentifier(node: BaseNode): node is Identifier {
  return node.type === "Identifier";
}
export function isImportDeclaration(node: BaseNode): node is ImportDeclaration {
  return node.type === "ImportDeclaration";
}
export function isImportExpression(node: BaseNode): boolean {
  // @types/estree does not yet support 2020 addons to ECMA.
  // This includes ImportExpression ... import("thing")
  return node.type === "ImportExpression";
}
export function isVariableDeclarator(
  node: BaseNode
): node is VariableDeclarator {
  return node.type === "VariableDeclarator";
}
export function isBlockStatement(node: BaseNode): node is BlockStatement {
  return node.type === "BlockStatement";
}
export function isProgram(node: BaseNode): node is Program {
  return node.type === "Program";
}
export function isExportNamedDeclaration(
  node: BaseNode
): node is ExportNamedDeclaration {
  return node.type === "ExportNamedDeclaration";
}
export function isExportDefaultDeclaration(
  node: BaseNode
): node is ExportDefaultDeclaration {
  return node.type === "ExportDefaultDeclaration";
}
export function isExportAllDeclaration(
  node: BaseNode
): node is ExportAllDeclaration {
  return node.type === "ExportAllDeclaration";
}
export function isFunctionDeclaration(
  node: BaseNode
): node is FunctionDeclaration {
  return node.type === "FunctionDeclaration";
}
export function isVariableDeclaration(
  node: BaseNode
): node is VariableDeclaration {
  return node.type === "VariableDeclaration";
}
export function isClassDeclaration(node: BaseNode): node is ClassDeclaration {
  return node.type === "ClassDeclaration";
}
export function isExportSpecifier(node: BaseNode): node is ExportSpecifier {
  return node.type === "ExportSpecifier";
}
export function isProperty(node: BaseNode): node is Property {
  return node.type === "Property";
}
