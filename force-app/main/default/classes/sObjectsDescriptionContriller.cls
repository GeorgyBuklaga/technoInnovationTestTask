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
        String url;
        List<Schema.DescribeTabSetResult> tabSetDesc = Schema.describeTabs();
        List<Schema.DescribeTabResult> tabDescribes = new List<Schema.DescribeTabResult>();
        List<Schema.DescribeIconResult> iconDescribes = new List<Schema.DescribeIconResult>();

        for(Schema.DescribeTabSetResult tsr : tabSetDesc) {
            tabDescribes.addAll(tsr.getTabs());
        }

        for(Schema.DescribeTabResult tabDescribe : tabDescribes) {
            if( sObjectName == tabDescribe.getSobjectName() ) {
                if( tabDescribe.isCustom() == true ) {
                    iconDescribes.addAll(tabDescribe.getIcons());
                } else {
                    url = 'standard:' + sObjectName.toLowerCase();
                }
            }
        }

        for (Schema.DescribeIconResult iconDescribe : iconDescribes) {
            if (iconDescribe.getContentType() == 'image/svg+xml'){
                url = 'custom:' + iconDescribe.getUrl().substringBetween('custom/','.svg').substringBefore('_');
                break;
            }
        }

        return url;
    }

}