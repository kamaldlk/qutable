import { generateId } from './utils';

export function FormDataWrapper(formData, changeSet = {}) {
  return new Model(formData, changeSet);
}

class Model {
  constructor(formData, changeSet) {
    this.dataSet = formData;
    this.id = formData.Id;
    this.changeSet = changeSet;
  }

  getValue(name) {
    let val = this.dataSet[name];
    let currentSet = this.changeSet[this.id];
    if(currentSet && currentSet.hasOwnProperty(name)) {
      return currentSet[name];
    }
    return val || "";
  }

  getList(childName) {
    let childChangeSet = this.getChildChangeSet(childName);

    let val = this.dataSet['Table::' + childName] || [];
    let childList = [];
    for(let childDict of val) {
      //remove the deleted entry from child list
      if(childChangeSet.D.indexOf(childDict.Id) === -1) {
        childList.push(FormDataWrapper(childDict, childChangeSet.U));
      }
    }

    //add the newly created entry to childlist
    for(let id in childChangeSet.C) {
      let childObj = FormDataWrapper(childChangeSet.C[id], childChangeSet.U);
      childList.splice(childChangeSet.C[id]._Index, 0, childObj);
    }
    return childList;
  }

  update(name, value) {
    let currentSet = this.getCurrentSet();
    currentSet[name] = value;
  }

  updateMulti(args = {}) {
    for(let name in args) {
      let value = args[name];
      this.update(name, value);
    }
  }

  create(childName, insertAfter = -1, params = {}) {
    let childChangeSet = this.getChildChangeSet(childName);

    let existingChildList = this.dataSet['Table::' + childName] || [];
    let childId = generateId(childName);
    let args = { Id: childId, _Index: insertAfter === -1 ? existingChildList.length : insertAfter };
    childChangeSet.C[childId] = args;
    let child = FormDataWrapper(args, childChangeSet.U);
    child.updateMulti(params);
    return child;
  }

  delete(childName, id) {
    let childChangeSet = this.getChildChangeSet(childName);
    if(childChangeSet.C.hasOwnProperty(id)) {
      Reflect.deleteProperty(childChangeSet.C, id);
      if(childChangeSet.U.hasOwnProperty(id)) {
        Reflect.deleteProperty(childChangeSet.U, id);
      }
    } else {
      childChangeSet.D.push(id);
    }
  }

  getCurrentSet() {
    let currentSet = this.changeSet[this.id];
    if(!currentSet) {
      currentSet = {};
      this.changeSet[this.id] = currentSet;
    }
    return currentSet;
  }

  getChildChangeSet(childName) {
    let currentSet = this.getCurrentSet();
    let name = 'Table::' + childName;
    let childChangeSet = currentSet[name];
    if(!currentSet[name]) {
      childChangeSet = { C: {}, U: {}, D: [] };
      currentSet[name] = childChangeSet;
    }
    return childChangeSet;
  }

  merge(summaryData = this.changeSet) {
    let changeSet = summaryData[this.id];
    for(let key in changeSet) {
      console.log(key);
      let val = changeSet[key];
      if(key.indexOf("::") === 5) {
        let existingchildList = this.dataSet[key];
        if(existingchildList == null) {
          existingchildList = [];
          this.dataSet[key] = existingchildList;
        }
        let existingChildIds = existingchildList.map((childDict) => {return childDict.Id;});
        for(let childId in val.C || {}) {
          let childDict = val.C[childId];
          existingchildList.splice(childDict._Index, 0, childDict);

          //remove the childId from C changeset after merging
          Reflect.deleteProperty(val.C, childId);
        }

        for(let childId in val.U || {}) {
          let childDict = val.U[childId];
          let itemIndex = existingChildIds.indexOf(childId);
          let existingChildDict = existingchildList[itemIndex];
          Object.assign(existingChildDict, childDict);

          let newIndex = existingChildDict._Index;
          if(newIndex !== null) {
            Reflect.deleteProperty(existingChildDict, "_Index");

            if(itemIndex < newIndex) {
              existingchildList.splice(newIndex, 0, existingChildDict);
              existingchildList.splice(itemIndex, 1);
            } else if(itemIndex > newIndex) {
              existingchildList.splice(itemIndex, 1);
              existingchildList.splice(newIndex, 0, existingChildDict);
            }
          }
          //clear the update dict after merging;
          Reflect.deleteProperty(val.U, childId);
        }

        for(let childId of val.D || []) {
          let itemIndex = existingChildIds.indexOf(childId);
          existingchildList.splice(itemIndex, 1);

          //remove the merged entry from changeset
          val.D.splice(0, 1);
        }
      } else {
        this.dataSet[key] = val;
        //remove the key from changeSet after merging
        Reflect.deleteProperty(this.changeSet, key);
      }
    }
  }
}
