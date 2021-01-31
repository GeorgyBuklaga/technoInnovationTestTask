/**
 * @description Controller class for LWC component sObjectsDescription
 * @author            : georgy.buklaga@gamil.com | 01-31-2020
 * @group             :
 * @last modified on  : 10-02-2020
 * @last modified by  : vladimir.shardyko@vrpconsulting.com
 * Modifications Log
 * Ver   Date         Author                                Modification
 * 1.0   01-31-2020   geo: georgy.buklaga@gamil.com         Initial Version
 */
public with sharing class sObjectsDescriptionContriller {

//    <c-vtra_resource-request-item-lookup-component
//    label={contactFieldLabel}
//    data-name="Resource"
//    target-object-api-name={contactObjectApiName}
//    record-id={contactId}
//    record-name={contactNameValue}
//    listbox-item-icon-name="standard:contact"
//    disabled={isResourceDisabled}
//    required={isResourceRequired}
//    onselection={handleSelection}>
//    </c-vtra_resource-request-item-lookup-component>

    /**
     * @description Retrieves all SObject names
     * @author georgy.buklaga@vrpconsulting.com | 01-31-2020
     * @return List<String> returns a list of SObject names
     */
    @AuraEnabled
    public static  Map<String, String> getSobjectNames() {
        Map<String, SObjectType>  objectNameToSobjectTypeMap= Schema.getGlobalDescribe();
        Map<String, String> objectLabelToApiNameMap = new Map<String, String>();
        for (SObjectType objectDescribe: objectNameToSobjectTypeMap.values()) {
            objectLabelToApiNameMap.put(
                objectDescribe.getDescribe().getLabel(),
                objectDescribe.getDescribe().getName()
            );
        }
        return objectLabelToApiNameMap;
    }

    @AuraEnabled(cacheable=true)
    public static String getIconName(String sObjectName){
        system.debug('sObjectName:: '+sObjectName);
        String u;
        List<Schema.DescribeTabSetResult> tabSetDesc = Schema.describeTabs();
        List<Schema.DescribeTabResult> tabDesc = new List<Schema.DescribeTabResult>();
        List<Schema.DescribeIconResult> iconDesc = new List<Schema.DescribeIconResult>();

        for(Schema.DescribeTabSetResult tsr : tabSetDesc) {
            tabDesc.addAll(tsr.getTabs());
        }

        for(Schema.DescribeTabResult tr : tabDesc) {
            if( sObjectName == tr.getSobjectName() ) {
                if( tr.isCustom() == true ) {
                    iconDesc.addAll(tr.getIcons());
                } else {
                    u = 'standard:' + sObjectName.toLowerCase();
                }
            }
        }
        for (Schema.DescribeIconResult ir : iconDesc) {
            if (ir.getContentType() == 'image/svg+xml'){
                u = 'custom:' + ir.getUrl().substringBetween('custom/','.svg').substringBefore('_');
                break;
            }
        }
        system.debug('iconName:: '+u);
        return u;
    }

}