import { useState, useMemo, useCallback, useRef } from "react"
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-balham.css'
import 'ag-grid-enterprise'
import 'bootstrap/dist/css/bootstrap.css';
import './App.css'


export default function FormfieldsGrid(props) {

    const [totalcount, setTotalCount] = useState(0);
    const [formNotPresent, setFormNotPresent] = useState(0);
    const [captchaFound, setCaptchaFound] = useState(0);
    const [submitButtonNotFound, setSubmitButtonNotFound] = useState(0);

    const gridRef = useRef();

    const getChildCount = useCallback(
        (data) => {
            return data ? data.childCount : undefined
        },
        []
    )

    const popupParent = useMemo(() => {
        return document.body;
    }, [])

    const autoGroupColumnDef = {
        headerName: 'Group',
        width: 500, // Set the desired width for pivot groups
        cellRenderer: 'agGroupCellRenderer', // Use the built-in group cell renderer
    };
    const sideBar = useMemo(() => {
        return {
            toolPanels: [
                {
                    id: 'columns',
                    labelDefault: 'Columns',
                    labelKey: 'columns',
                    iconKey: 'columns',
                    toolPanel: 'agColumnsToolPanel',
                },
                {
                    id: 'filters',
                    labelDefault: 'Filters',
                    labelKey: 'filters',
                    iconKey: 'filter',
                    toolPanel: 'agFiltersToolPanel',
                },
                // {
                //     id: 'customStats',
                //     labelDefault: 'Custom Stats',
                //     labelKey: 'customStats',
                //     iconKey: 'custom-stats',
                //     toolPanel: CustomStatsToolPanel,
                // },
            ],
            defaultToolPanel: '',
        };
    }, []);

    const datasource = {
        getRows(params) {
            console.log(JSON.stringify(params.request, null, 1));

            fetch('http://localhost:5000/getforms', {
                method: 'post',
                body: JSON.stringify(params.request),
                headers: { "Content-Type": "application/json; charset=utf-8" }
            })
                .then(httpResponse => httpResponse.json())
                .then(response => {
                    params.successCallback(response.rows, response.lastRow);
                })
                .catch(error => {
                    console.error(error);
                    params.failCallback();
                })
        }
    };


    const statistics = async () => {
        try {
            const httpResponse = await fetch('http://localhost:5000/getstatistics', {
                method: 'get',
                headers: { "Content-Type": "application/json; charset=utf-8" }
            })
            const response = await httpResponse.json() 
            setTotalCount(response.totalCount)
            setFormNotPresent(response.formsNotFound)
            setCaptchaFound(response.captchaPresent)
            // setSubmitButtonNotFound(response.SubmitButtonNotPresent)
            // setLessThanThreeFields(response.lessThanThreeFields)
        } catch (error) {
            console.error(error)
        }
    }

    const onGridReady = useCallback((params) => {
        //console.log('grid is ready')
        gridOptions.api.setServerSideDatasource(datasource);
        statistics()
    }, []);

    const onRefresh = useCallback((params) => {
        console.log('refreshing')
        gridOptions.api.setServerSideDatasource(datasource);
        statistics()
    }, []);

    const handleRowClick = async (event) => {

        if (event.data && event.data.url) {
            try {
                console.log('row clicked for ', event.data.url)
                const response = await fetch('http://localhost:5000' + '/getformfields?url=' + event.data.url, { method: 'Get' });
                let jsondata = await response.json(); 
                props.getFormFields([jsondata]);
            } catch (err) {
                console.log(err.message)
            }

        }
    }
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);

    const gridOptions = {

        rowModelType: 'serverSide',
        columnDefs: [
            { headerName: "Row", valueGetter: "node.rowIndex + 1", pinned: 'left', width: 70},
            { field: 'url', headerName: 'url', filter: 'agTextColumnFilter', width: 500, headerClass: 'custom-header-class' },
            { field: 'form_count', header: 'form count', filter: 'agTextColumnFilter', width: 200, headerClass: 'custom-header-class' },
            { field: 'captcha', header: 'captcha', filter: 'agTextColumnFilter', width: 200, headerClass: 'custom-header-class' },
        ],

        defaultColDef: {
            editable: true,
            sortable: true,
            filter: true,
            floatingFilter:true,
            resizable: true,
            // floatingFilter: true,
            // rowDrag: true,
            enableValue: true,
            enableRowGroup: true,
            enablePivot: true,
        },

        sideBar: sideBar,
        rowGroupPanelShow: 'always',
        rowSelection: 'multiple',
        columnHoverHighlight: true,
        suppressRowGroupHidesColumns: true,
        // pivotMode: true,
        autoGroupColumnDef: autoGroupColumnDef,
        getChildCount: getChildCount,
        popupParent: popupParent,
        // debug: true,
        cacheBlockSize: 50,
        // maxBlocksInCache: 3,
        // purgeClosedRowNodes: true,
        // maxConcurrentDatasourceRequests: 2,
        // blockLoadDebounceMillis: 1000
    }

    return (
        <div className="mt-2" >
            <div className="d-flex justify-content-between  mb-2">
                <button type="button" onClick={onRefresh}>Refresh Data</button>
                <div>
                    <button type="button" className="border border-info mx-2">Total : {totalcount}</button>
                    <button type="button" className="border border-info mx-2">Captcha : {captchaFound} ({Math.round((captchaFound/totalcount)*100)}%)</button>
                    <button type="button" className="border border-info mx-2">No Forms in : {formNotPresent}</button>
                    {/*<button type="button" className="border border-info">SubmitButton Not found : {submitButtonNotFound}</button>
                     <button type="button" className="btn btn-secondary btn-sm border border-info">less than 3 fields : {lessThanThreeFields}</button> */}
                </div>
            </div>

            <div className="ag-theme-balham" style={{ width: '100%', height: '42vh' }}>
                <AgGridReact
                    gridOptions={gridOptions}
                    ref={gridRef}
                    onGridReady={onGridReady}
                    onRowClicked={handleRowClick}
                />
            </div>

        </div>
    )
}