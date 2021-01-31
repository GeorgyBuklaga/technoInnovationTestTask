import { LightningElement, track, api, wire } from "lwc";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import getIconName from '@salesforce/apex/sObjectsDescriptionContriller.getIconName';
import getSobjectNames from '@salesforce/apex/sObjectsDescriptionContriller.getSobjectNames';

// import UNKNOWN_ERROR_MESSAGE_LABEL from "@salesforce/label/c.UnknownErrorMessage";
// import ERROR_TITLE_LABEL from "@salesforce/label/c.ErrorTitle";


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
    @track columns = COLUMNS;
    @track labels = {
        LOADING: 'Loading'
    };


    @wire(getObjectInfo, { objectApiName: "$objectApiName" })
    sObjectInfo({ data, error }) {
        if (data) {
            this.objectInfo = data;
            this.fields = Object.values(data.fields);
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
                this.showSpinner = false;
            })
            .catch(error => {
                this.showErrorMessage(ERROR_TITLE, error.body.message);
            }).finally(() => this.showSpinner = false);
    }

    get isAccessable() {
        return this.objectInfo.cancelable;
    }

    get isQueryable() {
        return this.objectInfo.queryable;
    }

    get isCustom() {
        return this.objectInfo.custom;
    }

    get isUpdatable() {
        return this.objectInfo.updateable;
    }

    get isUpdatable() {
        return this.objectInfo.keyPrefix;
    }

    get isObjectSelected() {
        return this.objectInfo && this.objectInfo.fields;
    }

    get isLoading() {
        return !this.sObjectInfo.data && !this.sObjectInfo.error;
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

    showTable() {
        return this.isObjectSelected && Array.isArray(this.fields) && this.fields.length > 0;
    }

    handleObjectChange = event => {
        this.objectApiName = event.detail.value;
        this.showSpinner = true;
        this.objectInfo ={};
        this.fields =[];
    };

    handleSort = event => {
        const fieldName = event.detail.fieldName,
            sortDirection = event.detail.sortDirection;
        this.sortedBy = fieldName;
        this.sortedDirection = sortDirection;
        this.sortData(fieldName, sortDirection);
    };

    sortData = (fieldName, sortDirection) => {
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

        this.fields = [...this.fields.sort(compareFunc)];
    };

    dispatchDefinedEvent(eventName, data) {
        this.dispatchEvent(
            new CustomEvent(eventName, {
                detail: data,
                bubbles: true
            })
        );
    }
}

