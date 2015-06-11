describe('Ext.field.Radio', function() {
    var field,
    create = function(config) {
        field = Ext.create('Ext.field.Radio', config || {});
    },
    render = function() {
        if (field) {
            field.destroy();
        }
    };

    afterEach(function() {
        if (field) {
            field.destroy();
            field = null;
        }
    });

    describe("methods", function() {
        describe("getGroupValue", function() {
            var fieldset;

            beforeEach(function() {
                fieldset = Ext.create('Ext.form.FieldSet', {
                    items: [
                        {
                            xtype: 'radiofield',
                            name: 'one',
                            value: 'red'
                        },
                        {
                            xtype: 'radiofield',
                            name: 'one',
                            checked: true,
                            value: 'blue'
                        }
                    ]
                });

                fieldset.renderTo(Ext.getBody());
            });

            afterEach(function() {
                fieldset.destroy();
            });

            it("should return blue", function() {
                field = fieldset.down('radiofield');

                expect(field.getGroupValue()).toEqual('blue');
            });
        });
    });
});
