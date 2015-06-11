describe('Ext.field.Select', function() {
    var field,
        createField = function(config) {
            if (field) {
                field.destroy();
            }

            field = Ext.create('Ext.field.Select', config || {});
        };

    afterEach(function() {
        if (field) {
            field.destroy();
        }
    });

    describe("configurations", function() {
        describe("options", function() {
            beforeEach(function() {
                createField({
                    options: [
                        {text: 'One', value: 1},
                        {text: 'Two', value: 2},
                        {text: 'Three', value: 3}
                    ]
                });
            });

            it("should create a store with 3 items", function() {
                expect(field.getStore().getCount()).toEqual(3);
            });

            it("should set the value configuration to the first item", function() {
                expect(field.getRecord()).toEqual(field.getStore().getAt(0));
            });

            describe("with value", function() {
                beforeEach(function() {
                    createField({
                        value: 3,
                        options: [
                            {text: 'One', value: 1},
                            {text: 'Two', value: 2},
                            {text: 'Three', value: 3}
                        ]
                    });
                });

                it("should create a store with 3 items", function() {
                    expect(field.getStore().getCount()).toEqual(3);
                });

                it("should set the value configuration to the third item", function() {
                    expect(field.getRecord()).toEqual(field.getStore().getAt(2));
                    expect(field.getRecord().get('value')).toEqual(3);
                    expect(field.getRecord().get('text')).toEqual('Three');
                    expect(field.getValue()).toEqual(3);
                });
            });
        });

        describe("store", function() {
            beforeEach(function() {
                createField({
                    store: {
                        fields: ['text', 'value'],
                        data: [
                            {text: 'One', value: 1},
                            {text: 'Two', value: 2},
                            {text: 'Three', value: 3}
                        ]
                    }
                });
            });

            it("should create a store with 3 items", function() {
                expect(field.getStore().getCount()).toEqual(3);
            });

            describe("with value", function() {
                beforeEach(function() {
                    createField({
                        value: 3,
                        store: {
                            fields: ['text', 'value'],
                            data: [
                                {text: 'One', value: 1},
                                {text: 'Two', value: 2},
                                {text: 'Three', value: 3}
                            ]
                        }
                    });
                });

                it("should create a store with 3 items", function() {
                    expect(field.getStore().getCount()).toEqual(3);
                });

                it("should set the value configuration to the third item", function() {
                    expect(field.getRecord()).toEqual(field.getStore().getAt(2));
                    expect(field.getRecord().get('value')).toEqual(3);
                    expect(field.getRecord().get('text')).toEqual('Three');
                    expect(field.getValue()).toEqual(3);
                });
            });
        });

        describe("value", function() {
            describe("0", function() {
                beforeEach(function() {
                    createField({
                        value: 0,
                        options: [
                            {text: 'One', value: 0},
                            {text: 'Two', value: 1},
                            {text: 'Three', value: 2}
                        ]
                    });
                });

                it("should set the value after adding options", function() {
                    expect(field.getValue()).toEqual(0);
                });
            });

            describe("0", function() {
                beforeEach(function() {
                    createField({
                        value: 1,
                        options: [
                            {text: 'One', value: 0},
                            {text: 'Two', value: 1},
                            {text: 'Three', value: 2}
                        ]
                    });
                });

                it("should set the value after adding options", function() {
                    expect(field.getValue()).toEqual(1);
                });
            });

            describe("default value", function() {
                describe("none", function() {
                    beforeEach(function() {
                        createField();
                    });

                    it("should set the value after adding options", function() {
                        expect(field.getValue()).toEqual(null);

                        field.setStore({
                            fields: ['text', 'value'],
                            data: [
                                {text: 'One', value: 1},
                                {text: 'Two', value: 2},
                                {text: 'Three', value: 3}
                            ]
                        });

                        //autoSelect
                        expect(field.getValue()).toEqual(1);
                    });
                });

                describe("value", function() {
                    beforeEach(function() {
                        createField({
                            value: 3
                        });
                    });

                    it("should set the value after adding options", function() {
                        expect(field.getValue()).toEqual(null);

                        field.setStore({
                            fields: ['text', 'value'],
                            data: [
                                {text: 'One', value: 1},
                                {text: 'Two', value: 2},
                                {text: 'Three', value: 3}
                            ]
                        });

                        expect(field.getValue()).toEqual(3);
                    });
                });

                describe("setValue", function() {
                    describe("with value and store", function() {
                        beforeEach(function() {
                            createField({
                                value: 3,
                                store: {
                                    fields: ['text', 'value'],
                                    data: [
                                        {text: 'One', value: 1},
                                        {text: 'Two', value: 2},
                                        {text: 'Three', value: 3}
                                    ]
                                }
                            });
                        });

                        it("should set to null", function() {
                            expect(field.getValue()).toEqual(3);
                            field.setValue(null);
                            expect(field.getValue()).toEqual(null);
                        });
                    });

                    describe("with no value", function() {
                        beforeEach(function() {
                            createField();
                        });

                        it("should set to null", function() {
                            expect(field.getValue()).toEqual(null);
                            field.setStore({
                                fields: ['text', 'value'],
                                data: [
                                    {text: 'One', value: 1},
                                    {text: 'Two', value: 2},
                                    {text: 'Three', value: 3}
                                ]
                            });
                            expect(field.getValue()).toEqual(1);
                            field.setValue(null);
                            expect(field.getValue()).toEqual(null);
                        });
                    });
                });
            });
        });

        describe("autoSelect", function() {
            describe("when on", function() {
                beforeEach(function() {
                    createField({
                        store: {
                            fields: ['text', 'value'],
                            data: [
                                {text: 'One', value: 1},
                                {text: 'Two', value: 2},
                                {text: 'Three', value: 3}
                            ]
                        }
                    });
                });

                it("should set the value configuration to the first item", function() {
                    expect(field.getRecord()).toEqual(field.getStore().getAt(0));
                });
            });

            describe("when off", function() {
                beforeEach(function() {
                    createField({
                        autoSelect: false,
                        store: {
                            fields: ['text', 'value'],
                            data: [
                                {text: 'One', value: 1},
                                {text: 'Two', value: 2},
                                {text: 'Three', value: 3}
                            ]
                        }
                    });
                });

                it("should set the value to null", function() {
                    expect(field.getRecord()).toEqual(null);
                });
            });
        });
    });

    describe("TOUCH-2431", function() {
        it("should use store configuration", function() {
            Ext.define('Ext.MySelect', {
                extend: 'Ext.field.Select',

                config: {
                    store: {
                        fields: ['name', 'value'],
                        data: [
                            {
                                name: 'one',
                                value: 1
                            },
                            {
                                name: 'two',
                                value: 2
                            }
                        ]
                    }
                }
            });

            var select = Ext.create('Ext.MySelect');
            expect(select.getStore().getCount()).toEqual(2);
        });
    });

    describe("events", function() {
        describe("change", function() {
            describe("without options", function() {
                beforeEach(function() {
                    createField();
                });

                it("should only fire change once when adding options", function() {
                    var fired = false;

                    field.on('change', function() {
                        expect(fired).toBeFalsy();
                        fired = true;
                    }, this);

                    field.setOptions([
                        {text: 'One', value: 1},
                        {text: 'Two', value: 2},
                        {text: 'Three', value: 3}
                    ]);

                    expect(fired).toBeTruthy();
                });
            });

            describe("with options", function() {
                beforeEach(function() {
                    createField({
                        options: [
                            {text: 'One', value: 1},
                            {text: 'Two', value: 2},
                            {text: 'Three', value: 3}
                        ]
                    });
                });

                it("should fire when you change the value", function() {
                    var fired = false;

                    field.on('change', function() {
                        expect(fired).toBeFalsy();
                        fired = true;
                    }, this);

                    field.setValue(2);

                    expect(fired).toBeTruthy();
                });

                it("should not fire when you dont change the value", function() {
                    var fired = false;

                    field.on('change', function() {
                        expect(fired).toBeFalsy();
                        fired = true;
                    }, this);

                    field.setValue(1);

                    expect(fired).toBeFalsy();
                });
            });
        });
    });

    describe("methods", function() {
        describe("reset", function() {
            describe("when autoSelect is on", function() {
                beforeEach(function() {
                    createField({
                        store : {
                            fields : ['text', 'value'],
                            data   : [
                                { text : 'One',   value : 1 },
                                { text : 'Two',   value : 2 },
                                { text : 'Three', value : 3 }
                            ]
                        }
                    });

                    field.setValue(3);
                });

                it("should set the value configuration to the first item", function() {
                    field.reset();

                    expect(field.getRecord()).toBe(field.getStore().getAt(0));
                });
            });

            describe("when autoSelect is off", function() {
                beforeEach(function() {
                    createField({
                        autoSelect : false,
                        store      : {
                            fields  : ['text', 'value'],
                            data    : [
                                { text : 'One',   value : 1 },
                                { text : 'Two',   value : 2 },
                                { text : 'Three', value : 3 }
                            ]
                        }
                    });

                    field.setValue(3);
                });

                it("should set the value to null", function() {
                    field.reset();

                    expect(field.getRecord()).toBe(null);
                });
            });
        });
    });
});
