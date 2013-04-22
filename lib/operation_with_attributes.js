/*!
 * node-hbase-client - lib/operation_with_attributes.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var eventproxy = require('eventproxy');
var Bytes = require('./bytes');
var WritableUtils = require('./writable_utils');

function OperationWithAttributes() {
  this.attributes = {};
}

/**
 * Set attribute.
 * @param {String} name
 * @param {Bytes} value
 */
OperationWithAttributes.prototype.setAttribute = function (name, value) {
  if (!this.attributes && (value === null || value === undefined)) {
    return;
  }

  if (!this.attributes) {
    this.attributes = {};
  }

  if (value === null || value === undefined) {
    delete this.attributes[name];
    if (Object.keys(this.attributes).length === 0) {
      this.attributes = null;
    }
  } else {
    this.attributes[name] = value;
  }
};

OperationWithAttributes.prototype.getAttribute = function (name) {
  if (!this.attributes) {
    return null;
  }
  return this.attributes[name];
};

OperationWithAttributes.prototype.getAttributesMap = function () {
  return this.attributes || {};
};

// protected long getAttributeSize() {
//   long size = 0;
//   if (attributes != null) {
//     size += ClassSize.align(this.attributes.size() * ClassSize.MAP_ENTRY);
//     for (Map.Entry<String, byte[]> entry : this.attributes.entrySet()) {
//       size += ClassSize.align(ClassSize.STRING + entry.getKey().length());
//       size += ClassSize.align(ClassSize.ARRAY + entry.getValue().length);
//     }
//   }
//   return size;
// }

OperationWithAttributes.prototype.writeAttributes = function (out) {
  if (!this.attributes) {
    out.writeInt(0);
  } else {
    out.writeInt(Object.keys(this.attributes).length);
    for (var name in this.attributes) {
      WritableUtils.writeString(out, name);
      Bytes.writeByteArray(out, this.attributes[name]);
    }
  }
};

OperationWithAttributes.prototype.readAttributes = function (io, callback) {
  var self = this;
  io.readIteration(function (done) {
    WritableUtils.readString(io, ep.done(function (name) {
      Bytes.readByteArray(io, ep.done(function (value) {
        this.attributes[name] = value;
        ep.emit('attribute');
      }));
    }));
  }, function (err, items) {
    callback(err, self);
  });
};

// OperationWithAttributes.prototype.readAttributes = function (io, callback) {
//   var numAttributes = io.readInt();
//   if (numAttributes > 0) {
//     this.attributes = {};
//     for (var i = 0; i < numAttributes; i++) {
//       var name = WritableUtils.readString(io);
//       var value = Bytes.readByteArray(io);
//       this.attributes.put(name, value);
//     }
//   }
// };

module.exports = OperationWithAttributes;