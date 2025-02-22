import React from 'react';
import domtoimage from 'dom-to-image';
import { useSelector, useStore } from 'react-redux';
import { getContextSelectorForSlice } from '../../model/features/functions/loaders';
import { selectBoard } from '../../model/features/boards/boardsSlice';
import { Page, Text, View, Document, Image, StyleSheet, Link, pdf } from '@react-pdf/renderer';
import { useErrorBoundary } from 'react-error-boundary';
export default function ExportBoard ({ boardId, contextManager, triggerEvent }) {
    const { showBoundary } = useErrorBoundary();
    const { components } = useSelector((state) => selectBoard(state, boardId));
    const store = useStore();

    // useEffect with 'triggerEvent' used as onclick function cannot be placed within another element which has an onclick event
    // Eg: ToolBox.jsx has a parent element ListItem which has a click event, as per react standards, click events must be handled at parent
    /* useEffect(() => {
        if (triggerEvent > 0) {
            exportPdfDocument();
        }
    }, [triggerEvent]); */

    // Default function to create an image from the DOM node of the element
    async function getImageUrl (id) {
        const node = document.getElementById(id + '-inner');
        node.children[1].style.overflow = 'hidden';
        const image = await domtoimage.toPng(node);
        node.children[1].style.overflow = 'auto';
        return image;
    };
    // TODO if spreadsheet has a full view than by construction this will hide some rows and columns because the last of them with buttons isnt there anymore needs to be changed than
    // See above; For spreadsheets, the toolbar is excluded
    async function getSpreadsheetImageUrl (id) {
        const node = document.getElementById(id + '-inner');
        node.getElementsByClassName('Spreadsheet-container')[0].firstChild.style.display = 'none';
        node.getElementsByClassName('SpreadsheetTable')[0].firstChild.firstChild.lastChild.style.display = 'none';
        node.getElementsByClassName('SpreadsheetTable')[0].firstChild.lastChild.style.display = 'none';
        node.getElementsByClassName('SpreadsheetTable')[0].firstChild.firstChild.firstChild.style.minWidth = '80px';
        const arr = node.getElementsByClassName('overlay');
        for (let i = 0; i < arr.length; i++) {
            arr[i].style.opacity = 0;
        }
        const image = await domtoimage.toPng(node);
        node.getElementsByClassName('Spreadsheet-container')[0].firstChild.style.display = 'block';
        node.getElementsByClassName('SpreadsheetTable')[0].firstChild.firstChild.lastChild.style.display = 'table-cell';
        node.getElementsByClassName('SpreadsheetTable')[0].firstChild.lastChild.style.display = 'inline-block';
        for (let i = 0; i < arr.length; i++) {
            arr[i].style.opacity = 1;
        }
        return image;
    };

    // See above; For diagrams, render only the graph, not the settings
    async function getDiagramImageUrl (id) {
        const node = document.getElementById(id + '-inner')/* .getElementsByClassName('svgContainer')[0] || document.getElementById(id + '-inner').childNodes[1] */;
        if (node.children[1].firstChild.type === 'button') {
            node.children[1].firstChild.style.display = 'none';
        }
        const image = await domtoimage.toPng(node);
        if (node.children[1].firstChild.type === 'button') {
            node.children[1].firstChild.style.display = 'inline-flex';
        }
        return image;
    };

    async function getIconImageUrl (index) {
        const node = document.getElementById('panel1bh-content').getElementsByTagName('ul')[0];
        const svgDiv = node.childNodes[index].getElementsByTagName('svg')[0].parentNode;
        return await domtoimage.toPng(svgDiv);
    };

    async function getBoardIconImageUrl (boardName) {
        const node = document.getElementById('container').getElementsByTagName('svg');
        let index = 0;
        switch (boardName) {
        case 'Skript':
            index = 2;
            break;
        case 'Notizbuch':
            index = 3;
            break;
        case 'Tafel':
            index = 4;
            break;
        }
        return await domtoimage.toPng(node[index].parentNode);
    };

    function getProgramName () {
        return String(document.getElementById('experimentName').childNodes[0].textContent);
    };

    function getExperimentName () {
        return String(document.getElementById('experimentName').childNodes[1].textContent);
    };

    function getDateString () {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        return dd + '.' + mm + '. ' + yyyy;
    };

    // Next two functions are currently unused, but provide the functionality of copying text elements in the future
    function showList (root, ord = 1, ol) {
        const elements = [];
        let order = ord;
        root.children.forEach(element => {
            if (Object.hasOwn(element, 'type')) {
                switch (element.type) {
                case 'li':
                    showList(element, order, ol).forEach(x => {
                        elements.push(x);
                    });
                    if (ol) {
                        order++;
                    }
                    break;
                default:
                    showList(element, order, ol).forEach(x => {
                        elements.push(x);
                    });
                    if (ol) {
                        order++;
                    }
                    break;
                }
            } else if (Object.hasOwn(element, 'text')) {
                if (element.text !== '') {
                    // Failed atempt to show bold text
                    if (ol) {
                        elements.push(<Text key={root.key}>{order + ' - ' + element.text}</Text>);
                    } else {
                        elements.push(<Text key={root.key}>{'   ' + element.text}</Text>);
                    }
                }
            }
        });
        return elements;
    };

    function showChildren (root, fontSize) {
        const elements = [];
        root.children.forEach(element => {
            if (Object.hasOwn(element, 'type')) {
                switch (element.type) {
                case 'h1':
                    showChildren(element, '24px').forEach(x => {
                        elements.push(x);
                    });
                    break;
                case 'h2':
                    showChildren(element, '22px').forEach(x => {
                        elements.push(x);
                    });
                    break;
                case 'h3':
                    showChildren(element, '20px').forEach(x => {
                        elements.push(x);
                    });
                    break;
                case 'h4':
                    showChildren(element, '18px').forEach(x => {
                        elements.push(x);
                    });
                    break;
                case 'h5':
                    showChildren(element, '16px').forEach(x => {
                        elements.push(x);
                    });
                    break;
                case 'h6':
                    showChildren(element, '14px').forEach(x => {
                        elements.push(x);
                    });
                    break;
                case 'ul':
                    showList(element, 0, false).forEach(x => {
                        elements.push(x);
                    });
                    break;
                case 'ol':
                    showList(element, 1, true).forEach(x => {
                        elements.push(x);
                    });
                    break;
                default:
                    showChildren(element, '14px').forEach(x => {
                        elements.push(x);
                    });
                    break;
                }
            } else if (Object.hasOwn(element, 'text')) {
                if (element.text !== '') {
                    let decoration = '';
                    if (Object.hasOwn(element, 'underline') && Object.hasOwn(element, 'strikethrough')) {
                        decoration = 'underline line-through';
                    } else if (Object.hasOwn(element, 'strikethrough')) {
                        decoration = 'line-through';
                    } else if (Object.hasOwn(element, 'underline')) {
                        decoration = 'underline';
                    } else {
                        decoration = 'none';
                    }
                    if (Object.hasOwn(element, 'bold') && Object.hasOwn(element, 'italic')) {
                        elements.push(<Text key={root.key} style= { { fontFamily: 'Helvetica-BoldOblique', textDecoration: decoration, fontSize: fontSize } }>{element.text}</Text>);
                    } else if (Object.hasOwn(element, 'bold')) {
                        elements.push(<Text key={root.key} style= { { fontFamily: 'Helvetica-Bold', textDecoration: decoration, fontSize: fontSize } }>{element.text}</Text>);
                    } else if (Object.hasOwn(element, 'italic')) {
                        elements.push(<Text key={root.key} style= { { fontFamily: 'Helvetica-Oblique', textDecoration: decoration, fontSize: fontSize } }>{element.text}</Text>);
                    } else {
                        elements.push(<Text key={root.key} style= { { fontFamily: 'Helvetica', textDecoration: decoration, fontSize: fontSize } }>{element.text}</Text>);
                    }
                }
            }
        });
        return elements;
    };

    function pluralizeToolName (toolName) {
        switch (toolName) {
        case 'Text':
        case 'Diagramm':
            return toolName + 'e';
        case 'Diagram':
            return toolName + 'me';
        case 'Tabelle':
        case 'ToDo Liste':
            return toolName + 'n';
        case 'Bild':
            return toolName + 'er';
        default:
            return toolName;
        }
    };

    function exportPdfDocument () {
        // PDF style sheet. There is still element-based styling in the pdf which will be migrated here in the future.
        const styles = StyleSheet.create({
            textImages: {
                margin: '5px 10px'
            },
            image: {
                display: 'block',
                maxWidth: '530px',
                minWidth: '150px',
                width: 'auto',
                height: 'auto'
            },
            pageStyle: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                orientation: 'portrait'
            },
            contentContainer: {
                flexGrow: '1',
                flexWrap: 'wrap',
                flexDirection: 'row',
                alignItems: 'flex-start'
            }
        });
        // Preparing relevant information on the elements on the board to be used in the pdf.
        const elementInfo = {
            image: [],
            spreadsheet: [],
            markdown: [],
            htmlcomp: [],
            todolist: [],
            diagram: []
        };
        const diagramSource = {};
        const spreadsheetMap = {};
        for (const componentId in components) {
            const { label, innerId, type } = components[componentId];
            if (type === 'comment' || type === 'progresstracker' || type === 'image') {
                continue;
            }
            const size = components[componentId].size;
            const selector = getContextSelectorForSlice(type);
            const fullContext = selector(store.getState(), innerId);
            elementInfo[type].push({
                componentId,
                size,
                label: label.description,
                innerData: fullContext // Currently only relevant for images.
            });
            if (type === 'diagram') {
                diagramSource[fullContext.ssid] = diagramSource[fullContext.ssid] ? diagramSource[fullContext.ssid].concat([componentId]) : [componentId];
            } else if (type === 'spreadsheet') {
                spreadsheetMap[componentId] = innerId;
            }
        };
        // Diagram to Spreadsheet maps (or vice versa) are currently broken, so none of these objects are currently used.
        // Might be revisited in the future.
        const spreadsheetDiagramMap = {};
        for (const componentId in spreadsheetMap) {
            if (spreadsheetMap[componentId] in diagramSource) {
                spreadsheetDiagramMap[componentId] = diagramSource[spreadsheetMap[componentId]];
            }
        };
        const boardIdSplit = boardId.split('-');
        const boardName = boardIdSplit[0].charAt(0).toUpperCase() + boardIdSplit[0].slice(1);
        const userName = boardIdSplit.length > 2 ? ' [' + boardIdSplit[2].charAt(0).toUpperCase() + boardIdSplit[2].slice(1) + ']' : '';
        const PageFooter = (props) => (
            <View style = { { padding: '20px 30px', justifyContent: 'space-between', fontSize: '12', color: 'grey', flexDirection: 'row', alignItems: 'flex-end' } }>
                <Text style = { { flexBasis: '30%' } }>{getProgramName() + ': ' + getExperimentName().split(' ')[0]}</Text>
                <Text>{ boardName + userName }</Text>
                { (props.noLink)
                    ? (<Text style = { { flexBasis: '30%', textAlign: 'right' } } render={({ pageNumber, totalPages }) => (`${pageNumber} / ${totalPages}`)} />)
                    : (<View style = { { flexDirection: 'column', alignItems: 'flex-end', flexBasis: '30%' } }>
                        <Text render={({ pageNumber, totalPages }) => (`${pageNumber} / ${totalPages}`)} />
                        <Link style = { { color: 'black' } } src='#firstPage'>Zurück zur Übersicht</Link>
                    </View>)}
            </View>
        );
        const PageTitle = (props) => (
            <View style={ { alignItems: 'center' } }>
                { (props.icon)
                    ? (<View style = { { flexDirection: 'row', alignItems: 'center', backgroundColor: '#004A96', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' } }>
                        <Text style = { { textAlign: 'center', padding: '10px 20px', color: 'white' } }>{ props.section }</Text>
                        { (boardName === 'Tafel')
                            ? <Image src={ getBoardIconImageUrl(boardName) } style = { { height: '34px', width: 'auto', margin: '3px -8px 3px 0', paddingRight: '16px' } } />
                            : <Image src={ getBoardIconImageUrl(boardName) } style = { { height: '40px', width: 'auto', margin: '0 -10px 0 0', paddingRight: '10px' } } />
                        }
                    </View>)
                    : (<Text style = { { backgroundColor: '#004A96', textAlign: 'center', padding: '10px 20px', borderBottomRightRadius: '10px', borderBottomLeftRadius: '10px', color: 'white' } }>{ props.section }</Text>)
                }
            </View>
        );
        const MyDoc = (
            <Document>
                <Page id='firstPage' orientation='landscape' style = { styles.pageStyle }>
                    <View style = { { flexDirection: 'column' } }>
                        <PageTitle section={`Übersicht ${boardName}${userName}`} icon = { true } />
                        <Text style = { { textAlign: 'center' } }>{getProgramName()}</Text>
                        <Text style = { { textAlign: 'center' } }>{getExperimentName()}</Text>
                        <Text style = { { textAlign: 'center' } }>{getDateString()}</Text>
                    </View>
                    <View style = { Object.assign({}, styles.contentContainer, { justifyContent: 'flex-start', alignItems: 'flex-start', alignContent: 'center', marginLeft: '10%' }) }>
                        {contextManager.toolList.filter(tool => !(tool.name === 'HTML' || 'Arbeitsaufträge')).map((tool, index) => (
                            <View key={index} style = { { flexBasis: '30%', margin: '25px 50px' } }>
                                <View style = { { flexDirection: 'row' } }>
                                    <Image src={ getIconImageUrl(index) } style = { { width: '50px', height: 'auto', marginRight: '-25px' } } />
                                    <Text>{ pluralizeToolName(tool.name) }:</Text>
                                </View>
                                {elementInfo[tool.type].map((element, index) => (
                                    <Link src={`#${element.componentId}`} key={index} style = { { fontSize: '12' } } >{ element.label }</Link>
                                ))}
                                <Text style = { { fontSize: '12', color: 'grey', marginTop: '6px' } }>Anzahl: { elementInfo[tool.type].length }</Text>
                            </View>
                        ))}
                    </View>
                    <PageFooter noLink = { true } />
                </Page>
                { (elementInfo.markdown.length > 0)
                    ? <Page style = { styles.pageStyle }>
                        <PageTitle section='Texte' />
                        <View style = { styles.contentContainer }>
                            { (elementInfo.markdown.map((element, index) => (
                                // Screenshot version of the texts. For text version, see comment block below.
                                <View id={element.componentId} wrap={false} key={index} style={ { margin: '5px 10px', width: Math.min(parseInt(element.size.width) * 0.8, 530), height: 'auto' } }>
                                    <Image src={getImageUrl(element.componentId)} style={ styles.image } ></Image>
                                </View>
                                /* // Copy-able text. needs refinement of some markdown elements (lists, sub-/super-script etc.)
                                <View key={index} style = { { border: '1px solid black', backgroundColor: '#e6e6e6', margin: '5px', padding: '5px' } } >
                                    {showChildren(element.innerData.value[0], '1em')}
                                </View> */
                            )))}
                        </View>
                        <PageFooter />
                    </Page>
                    : <></>
                }
                {(elementInfo.image.length > 0)
                    ? <Page style = { styles.pageStyle }>
                        <PageTitle section='Bilder' />
                        <View style = { styles.contentContainer }>
                            { (elementInfo.image.map((element, index) => (
                                <View id={element.componentId} wrap={false} key={index} style={ { margin: '5px 10px', border: '1px solid ccc', justifyContent: 'space-between', width: Math.min(parseInt(element.size.width * 0.75), 530), height: 'auto' } }>
                                    <Image src ={element.innerData.value.url} style = { Object.assign({}, styles.image, { padding: '5px' }) } />
                                    <Text style= { { marginBottom: '2px', textAlign: 'center' } }> {element.innerData.value.description} </Text>
                                </View>
                            )))}
                        </View >
                        <PageFooter />
                    </Page>
                    : <></>
                }
                {(elementInfo.spreadsheet.length > 0)
                    ? <Page style = { styles.pageStyle }>
                        <PageTitle section='Tabellen' />
                        <View style = { styles.contentContainer }>
                            { (elementInfo.spreadsheet.map((element, index) => (
                                <View id={element.componentId} wrap={false} key={index} style={ { margin: '5px 10px', float: 'center', width: Math.max(Math.min(530, parseInt((element.innerData.value.headers.length + 1) * 60)), 100), height: 'auto', maxHeight: 720 } }>
                                    <Image src={getSpreadsheetImageUrl(element.componentId)} style={ styles.image } ></Image>
                                </View>
                            )))}
                        </View >
                        <PageFooter />
                    </Page>
                    : <></>
                }
                {(elementInfo.diagram.length > 0)
                    ? <Page style = { styles.pageStyle }>
                        <PageTitle section='Diagramme' />
                        <View style = { styles.contentContainer }>
                            { (elementInfo.diagram.map((element, index) => (
                                <View id={element.componentId} wrap={false} key={index} style={ Object.assign({}, styles.textImages, { width: Math.min(parseInt(element.size.width * 0.75), 530), height: 'auto' })}>
                                    <Image src={getDiagramImageUrl(element.componentId)} style={ styles.image } ></Image>
                                </View>
                            )))}
                        </View>
                        <PageFooter />
                    </Page>
                    : <></>
                }
                {(elementInfo.todolist.length > 0)
                    ? <Page style = { styles.pageStyle }>
                        <PageTitle section='ToDo-Listen' />
                        <View style = { styles.contentContainer }>
                            { (elementInfo.todolist.map((element, index) => (
                                <View id={element.componentId} wrap={false} key={index} style={ Object.assign({}, styles.textImages, { width: Math.min(parseInt(element.size.width * 0.5), 530), height: 'auto' })}>
                                    <Image src={getImageUrl(element.componentId)} style={ styles.image } ></Image>
                                </View>
                            )))}
                        </View>
                        <PageFooter />
                    </Page>
                    : <></>
                }
                {/* (elementInfo.htmlcomp.length > 0)
                    ? <Page style = { styles.pageStyle }>
                        <PageTitle section='HTML-Elemente' />
                        <View style = { styles.contentContainer }>
                            { (elementInfo.htmlcomp.map((element, index) => (
                                <View id={element.componentId} wrap={false} key={index} style={ Object.assign({}, styles.textImages, { width: 'auto', height: 'auto' })}>
                                    <Image src={getImageUrl(element.componentId)} style={ styles.image } ></Image>
                                </View>
                            )))}
                        </View>
                        <PageFooter />
                    </Page>
                    : <></>
                */}
            </Document>
        );
        // turning the document into a pdf and generating a url from blob
        // toggle debug value below to switch from download (false) to opening in new tab (true)
        const debugDownload = true;
        const a = document.createElement('a');
        pdf(MyDoc).toBlob().then((blob) => {
            const url = window.URL.createObjectURL(blob);
            if (debugDownload) {
                window.open(url);
            } else {
                a.href = url;
                a.download = `PDF-Export${boardId}.pdf`;
                a.click();
            }
        });
    }

    return (
        <span onClick={(e) => { try { exportPdfDocument(e); } catch (err) { showBoundary(err); } }}>Pdf Export</span>
    );
}
