export interface IFinanceAppTableConfig {
        //do not manually modify these properties
        htmlString: string;
        _tmpValue: any;
        noColumns: number;
        columns: Array<any>;
        keys: Array<any>;
        labels: Array<any>;
        hasHeaderRows: boolean;
        headerRows: Array<any>;
        rows: Array<any>;
        timeFieldIds: Array<any>;
        summaryFieldIds: Array<any>;
        timeColHeaderIds: Array<any>;
        rowIds: Array<any>;
        mltGuids: Array<any>;
        cellClass: string;
        colHeaderClass: string;
        rowHeaderClass: string;
        rowInputClass: string;
        colSummaryClass: string;
        displayMode: boolean;
        summaryColumns: any | Array<{values:Array<number|string>;guid:string;label:string;}>;
        showRowLabels: boolean;
        noSummaryColumns: number;
        noTimephasedColumns: number;
        showColumnTotals: boolean;
        noTotalColumns: number;
        totalColumnHeader: string;
        lookupGuids: Array<any>;
        lookupLists: { [prop : string]: Array<string | number>;};
        promises: Array<any>;
        configVersion: number;
        totalFieldIds: Array<any>;
}

