Ext.define('CountVariableSettingsComponent',{
  extend: 'Ext.form.field.Base',
      alias: 'widget.countvariablesettings',

      fieldSubTpl: '<div id="{id}" class="settings-grid"></div>',

      layout: 'vbox',
      cls: 'advanced-filter-panel',
      header: false,
      maxHeight: 350,
      height: 350,
      minHeight: 50,
      border: false,
      overflowY: 'auto',
      config: {
        value: undefined,
      },

      onRender: function() {
          this.callParent(arguments);

          var decodedValue = this.value;
          if (Ext.isString(decodedValue)){
             decodedValue = Ext.JSON.decode(decodedValue);
          }
          this._buildItems(decodedValue);

      },
      _buildItems: function(value) {

        var items = [];
        this.countVariableRows = [];
        Ext.Array.each(value, function(cv, i){
            var lastRow = i === value.length -1;
            var rowConfig = this._getRowConfig(cv);
            rowConfig.addButtonEnabled = lastRow;
            rowConfig.removeButtonEnabled = true;
            var item = Ext.widget(rowConfig);
            items.push(item);
            this.countVariableRows.push(item);
        },this);

        if (Ext.isEmpty(items)) {
            this._emptyRow = Ext.widget(this._getEmptyRowConfig());
            items.push(this._emptyRow);
            //this.countVariableRows.push(item);
        }

        // items.unshift({
        //   xtype: 'container',
        //   layout: 'hbox',
        //   cls: 'advanced-filter-row',
        //   items: [{
        //     xtype: 'label',
        //     cls: 'variable-label',
        //     text: 'Count Variable Name',
        //     width: 175,
        //     margin: '5 5 5 60'
        //   },{
        //     xtype: 'label',
        //     cls: 'variable-label',
        //     text: 'Artifact Type',
        //     width: 175,
        //     margin: 5
        //   },{
        //     xtype: 'label',
        //     cls: 'variable-label',
        //     text: 'Query',
        //     margin: 5
        //   }]
        // });


        this._countVariableContainer = Ext.widget({
          xtype: 'container',
          renderTo: this.inputEl,
          maxHeight: 300,
          minHeight: 300,
          autoScroll: true,
          //overflowY: 'auto',
          itemId: 'countVariableContainer',
          layout: {
            type: 'vbox',
            align: 'stretch'
          },
          cls: 'filters-container',
          items: items
        });

      },

    _getRowConfig: function(countVariable) {
        if (!countVariable){
          countVariable={};
        }
        return {
            xtype: 'countvariablesettingsrow',
            variableName: countVariable.id || '',
            artifactType: countVariable.artifactType || 'HierarchicalRequirement',
            query: countVariable.query || '',
            listeners: {
                addrow: function() {
                    this._addRow(true);
                },
                removerow: this._removeRow,
                rowvalidate: this._toggleRowButtons,
                scope: this
            }
        };
    },
    _getEmptyRowConfig: function(){

        return {
            xtype: 'countvariablesettingsrow',
            isEmpty: true,
            addButtonEnabled: true,
            itemId: 'emptyRow',
            listeners: {
                addrow: function() {
                    this._addRow(true);
                },
                scope: this
            }
        };
    },
    _addEmptyRow: function(){
      this._emptyRow = Ext.widget(this._getEmptyRowConfig());
      this._countVariableContainer.add(this._emptyRow);
    },
    _removeEmptyRow: function(){
      if (this._emptyRow){
        this._countVariableContainer.remove(this._emptyRow);
        this._emptyRow.destroy();
      }

    },
    _addRow: function(focusOnAdd) {

        if (Ext.isEmpty(this.countVariableRows)) {
          this._removeEmptyRow();
            //_.last(this.countVariableRows).disableAddRow();
        }

        var row = Ext.widget(this._getRowConfig());
        this.countVariableRows.push(row);
        this._countVariableContainer.add(row);
    },
    _removeRow: function(row, opts) {
        var previousRowIndex = Math.max(0, _.findIndex(this.countVariableRows, row) - 1);
        _.remove(this.countVariableRows, row);
        this._countVariableContainer.remove(row);

        if (Ext.isEmpty(this.countVariableRows)) {
            //this._addRow(opts.autoFocus === false ? false : true);
            this._addEmptyRow();
        } else if (opts.autoFocus && this.countVariableRows[previousRowIndex].valueField) {
            this.countVariableRows[previousRowIndex].queryField.focus();
        }

        var lastRow = _.last(this.countVariableRows);

        if (!Ext.isEmpty(lastRow) && lastRow.isValid()) {
            lastRow.enableAddRow();
        }

        this._toggleRowButtons(lastRow);
    },

    _toggleRowButtons: function(row) {
        if (Ext.isEmpty(row)){
          return;
        }

        if (row.isValid() && row === _.last(this.countVariableRows)) {
            row.enableAddRow();
        } else {
            row.disableAddRow();
        }

        if (this.countVariableRows.length === 1){
      //    row.disableRemoveRow();
        } else {
          row.enableRemoveRow();
        }
    },

    /**
     * When a form asks for the data this field represents,
     * give it the name of this field and the ref of the selected project (or an empty string).
     * Used when persisting the value of this field.
     * @return {Object}
     */
    getSubmitData: function() {
        var data = {};
        data[this.name] = Ext.JSON.encode(this._getData());
        return data;
    },

    _getData: function() {
        var setting = [];
        Ext.Array.each(this.countVariableRows, function(cvr){
           setting.push(cvr.getCountVariable());
        });

        return setting;
    },

    getErrors: function() {
        var errors = [];
        var countVariableNames = [];
        Ext.Array.each(this.countVariableRows, function(cvr){
           var error = cvr.validate();
           if (error){
             errors.push(error);
           }

           if (Ext.Array.contains(countVariableNames, cvr.getVariableName())){
             errors.push("Duplicate Variable Names {" + cvr.getVariableName() + "}.  Variable Names must be unique.");
           } else {
             countVariableNames.push(cvr.getVariableName());
           }
        });
        return _.uniq(errors);
    },

    setValue: function(value) {
        this.callParent(arguments);
        this._value = value;
    }

});
