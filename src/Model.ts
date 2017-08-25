import * as _ from 'lodash'
import { Schema as NormalizrSchema } from 'normalizr'
import Data, { Records, NormalizedData } from './Data'
import Attributes, { Type as AttrType, Attr, BelongsTo } from './Attributes'
import Schema from './Schema'

export interface Fields {
  [field: string]: Attr | BelongsTo
}

abstract class Model {
  /**
   * The name that is going be used as module name in Vuex Store.
   */
  static entity: string

  /**
   * Dynamic properties that field data should be assigned at instantiation.
   */
  ;[key: string]: any

  /**
   * Creates a model instance.
   */
  constructor (data?: Records) {
    this.$initialize(data)
  }

  /**
   * The definition of the fields of the model and its relations.
   */
  static fields (): Fields {
    return {}
  }

  /**
   * The generic attribute. The given value will be used as default value
   * of the property when instantiating a model.
   */
  static attr (value: any): Attr {
    return Attributes.attr(value)
  }

  /**
   * Creates belongs to relationship.
   */
  static belongsTo (model: typeof Model, foreignKey: string): BelongsTo {
    return Attributes.belongsTo(model, foreignKey)
  }

  /**
   * Create normalizr schema that represents this model.
   *
   * @param {boolean} many If true, it'll return an array schema.
   */
  static schema (many: boolean = false): NormalizrSchema {
    return many ? Schema.many(this) : Schema.one(this)
  }

  /**
   * Generate normalized data from given data.
   */
  static normalize (data: any | any[]): NormalizedData {
    const schema = this.schema(_.isArray(data))

    return Data.normalize(data, schema)
  }

  /**
   * Returns the static class of this model.
   */
  $self (): typeof Model {
    return this.constructor as typeof Model
  }

  /**
   * The definition of the fields of the model and its relations.
   */
  $fields (): Fields {
    return this.$self().fields()
  }

  /**
   * Initialize the model by attaching all of the fields to property.
   */
  $initialize (data?: Records): void {
    const fields: Fields = this.$mergeFields(data)

    _.forEach(fields, (field, key) => {
      if (field.type === AttrType.Attr) {
        this[key] = field.value
      }
    })
  }

  /**
   * Merge given data into field's default value.
   */
  $mergeFields (data?: Records): Fields {
    if (!data) {
      return this.$fields()
    }

    let newFields: Fields = { ...this.$fields() }

    const fieldKeys: string[] = _.keys(newFields)

    _.forEach(data, (value, key) => {
      if (!_.includes(fieldKeys, key)) {
        return
      }

      if (newFields[key].type === AttrType.Attr) {
        newFields[key].value = value
      }
    })

    return newFields
  }
}

export default Model
