import { LightningElement, track, wire } from "lwc";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import getIconName from '@salesforce/apex/sObjectsDescriptionContriller.getIconName';
import getSobjectNames from '@salesforce/apex/sObjectsDescriptionContriller.getSobjectNames';

import UNKNOWN_ERROR_MESSAGE_LABEL from "@salesforce/label/c.UnknownErrorMessage";
import ERROR_TITLE_LABEL from "@salesforce/label/c.ErrorTitle";


const COLUMNS = [
        {
            label: "Label",
            fieldName: "label",
            type: "text",
            editable: false,
            sortable: true,
            wrapText: true,
            cellAttributes: {
                alignment: "left"
            }
        },
        {
            label: "Name",
            fieldName: "apiName",
            type: "text",
            editable: false,
            sortable: true,
            cellAttributes: {
                alignment: "left"
            }
        },
        {
            label: "Createable",
            fieldName: "createable",
            type: "boolean",
            editable: false,
            sortable: true,
            cellAttributes: {
                alignment: "left"
            }
        },
        {
            label: "Custom",
            fieldName: "custom",
            type: "boolean",
            editable: false,
            sortable: true,
            cellAttributes: {
                alignment: "left"
            }
        },
        {
            label: "Reference",
            fieldName: "reference",
            type: "boolean",
            editable: false,
            sortable: true,
            cellAttributes: {
                alignment: "left"
            }
        },
        {
            label: "Compound",
            fieldName: "compound",
            type: "boolean",
            editable: false,
            sortable: true,
            cellAttributes: {
                alignment: "left"
            }
        }
    ],
    OBJECT_PROPERTIES = [
        {
            label: "Api Name",
            fieldName: "apiName",
            value: "",
            isBoolean: false,
            isText: true
        },
        {
            label: "Key Prefix",
            fieldName: "keyPrefix",
            value: "",
            isBoolean: false,
            isText: true
        },
        {
            label: "Createable",
            fieldName: "createable",
            value: "",
            isBoolean: true,
            isText: false
        },
        {
            label: "Queryable",
            fieldName: "queryable",
            value: "",
            isBoolean: true,
            isText: false
        },
        {
            label: "Custom",
            fieldName: "custom",
            value: "",
            isBoolean: true,
            isText: false
        },
        {
            label: "Updateable",
            fieldName: "updateable",
            value: "",
            isBoolean: true,
            isText: false
        },
    ];

export default class SObjectsDescription extends LightningElement {
    objectApiName;
    iconName;
    showSpinner = false;
    sortedBy;
    sortedDirection = "asc";

    @track objectInfo;
    @track listOfObjectNames;
    @track options;
    @track fields;
    @track objectProperties = OBJECT_PROPERTIES;
    @track columns = COLUMNS;
    @track labels = {
        LOADING: 'Loading'
    };


    @wire(getObjectInfo, { objectApiName: "$objectApiName" })
    sObjectInfo({ data, error }) {
        if (data) {
            this.objectInfo = data;
            this.fields = Object.values(data.fields);
            this.objectProperties.forEach(item => {
                    item.value = this.objectInfo[item.fieldName];

                    return item;
                }
            );
        } else if (error) {
            this.showIssue(error);
        }
        this.showSpinner = false;

    }


    @wire(getIconName, { sObjectName: '$objectApiName' })
    gettingIconName({ error, data }) {
        if (data) {
            this.iconName = data;
        } else if (error) {
            this.showIssue(error);
        }
        this.showSpinner = false;
    }

    get isObjectSelected() {
        return this.objectInfo && this.objectInfo.fields;
    }

    connectedCallback() {
        this.getObjectNames();
    }

    getObjectNames() {
        this.showSpinner = true;

        getSobjectNames()
            .then(result => {
                this.listOfObjectNames = result;
                this.options = Object.keys(this.listOfObjectNames).map(objectLabel => {
                        return {
                            label: objectLabel,
                            value: result[objectLabel]
                        }
                    }
                );
                this.options = this.sortData("label", "asc", this.options);
                this.showSpinner = false;
            })
            .catch(error => {
                this.showErrorMessage(ERROR_TITLE, error.body.message);
            }).finally(() => this.showSpinner = false);
    }

    showIssue(error) {
        let message = UNKNOWN_ERROR_MESSAGE_LABEL;
        const title = ERROR_TITLE_LABEL;

        if (Array.isArray(error.body)) {
            message = error.body.map(e => e.message).join(", ");
        } else if (error.body && typeof error.body.message === "string") {
            message = error.body.message;
        } else if (typeof error === "string") {
            message = error;
        }
        this.showErrorMessage(title, message);
    }

    showSuccessMessage(title, message) {
        this.showMessage(title, message, "SUCCESS");
    }

    showErrorMessage(title, message) {
        this.showMessage(title, message, "ERROR");
    }

    showMessage(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }

    handleObjectChange = event => {
        this.objectApiName = event.detail.value;
        this.showSpinner = true;
        this.objectInfo = {};
        this.fields = [];
    };

    handleSort = event => {
        const fieldName = event.detail.fieldName,
            sortDirection = event.detail.sortDirection;
        this.sortedBy = fieldName;
        this.sortedDirection = sortDirection;
        this.fields = this.sortData(fieldName, sortDirection, this.fields);
    };

    sortData = (fieldName, sortDirection, listForSort) => {
        let compareFunc = (first, second) => {
            let result = 0;
            if (first[fieldName] < second[fieldName]) {
                result = -1;
            } else if (first[fieldName] > second[fieldName]) {
                result = 1;
            }
            return result;
        };
        if (sortDirection === "desc") {
            compareFunc = (first, second) => {
                let result = 0;
                if (first[fieldName] < second[fieldName]) {
                    result = 1;
                } else if (first[fieldName] > second[fieldName]) {
                    result = -1;
                }
                return result;
            };
        }

        return [...listForSort.sort(compareFunc)];
    };

}

