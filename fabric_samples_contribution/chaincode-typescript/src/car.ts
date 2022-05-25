/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Car {
    @Property()
    public docType?: string;

    @Property()
    public ID: string;

    @Property()
    public Model: string;

    @Property()
    public Owner: string;

    @Property()
    public Engine: string;

    @Property()
    public Brand: string;
}
