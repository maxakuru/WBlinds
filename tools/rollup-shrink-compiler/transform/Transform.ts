/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
  InputOptions,
  NormalizedOutputOptions,
  OutputOptions,
  PluginContext,
} from "rollup";
import { CompilerOptions } from "../options";
import { Ebbinghaus } from "./ebbinghaus";

export interface ITransform {
  name: string;
}

export default class implements ITransform {
  protected context: PluginContext;
  protected pluginOptions: CompilerOptions;
  protected inputOptions: InputOptions;
  protected outputOptions: OutputOptions;
  protected memory: Ebbinghaus;
  //   protected mangler: Mangle;
  public name = "Transform";

  constructor(
    context: PluginContext,
    pluginOptions: CompilerOptions,
    // mangler: Mangle,
    memory: Ebbinghaus,
    inputOptions: InputOptions,
    outputOptions: OutputOptions
  ) {
    this.context = context;
    this.pluginOptions = pluginOptions;
    this.inputOptions = inputOptions;
    this.outputOptions = outputOptions;
    this.memory = memory;
    // this.mangler = mangler;
  }
}
