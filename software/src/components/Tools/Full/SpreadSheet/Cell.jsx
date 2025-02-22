import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'unistore/react';
import * as PointSet from './point-set';
import * as PointMap from './point-map';
import * as Matrix from './matrix';
import * as Actions from './actions';
import { isActive, getOffsetRect } from './util';
import { COLOR_PALETTE } from './spreadsheetConfig';
export class Cell extends Component {
    // eslint-disable-next-line no-useless-constructor
    constructor (props) {
        super(props);
        this.color = { color: (props && props.data && props.data.color) ? props.data.color : '#ffffff' };
    }

    /** @todo update to new API */
  handleRoot = (root) => {
      this.root = root;
  };

  handleMouseDown = (e) => {
      const {
          row,
          column,
          setCellDimensions,
          select,
          activate,
          mode,
          updateCells,
          studentOnBoardSktipt,
          adminPreview
      } = this.props;
      if (mode === 'view') {
          // students soulg not modyfy components on the script
          if (studentOnBoardSktipt || adminPreview) {
              return;
          }
          setCellDimensions({ row, column }, getOffsetRect(e.currentTarget));

          if (e.shiftKey) {
              select({ row, column });
              return;
          }

          activate({ row, column });
          updateCells();
      }
  };

  handleMouseOver = (e) => {
      const { row, column, dragging, setCellDimensions, select } = this.props;
      if (dragging) {
          setCellDimensions({ row, column }, getOffsetRect(e.currentTarget));
          select({ row, column });
      }
  };

  getCellStyle = (e) => {
      const cellHighlightColor = this.evaluateCellHighlightFormatRules();
      const cellTextColor = ((cellHighlightColor && COLOR_PALETTE[cellHighlightColor] && COLOR_PALETTE[cellHighlightColor].textColor) || 'black');
      return { textAlign: this.evaulateCellValueAlignment(), background: cellHighlightColor, color: cellTextColor };
  };

  handleDoubleClick = (e) => {
      e.stopPropagation();
  };

  evaluateCellHighlightFormatRules = (e) => {
      const {
          cellHighlightFormatRules,
          row,
          column,
          data
      } = this.props;
      // If an individual cell has been defined with a colour, it will take precedence over the rules. Removing the colour will allow the rule formatting on the cell.
      if (data && data.color && data.color !== '#ffffff') {
          return data.color;
      }

      let finalColor = '';
      if (cellHighlightFormatRules) {
          Object.values(cellHighlightFormatRules).forEach(rule => {
              const { cellMatchType, cellRangeSelectionType, color, selectedRange, matchCellValueRange, matchCellText } = rule;
              // Case 1: If rule is to be applied to a specific range, we check if current cell falls in the range
              // Case 2: If the entire spreadsheet is selected as range
              if ((cellRangeSelectionType === 'Selected Range' && (selectedRange && row !== undefined && row in selectedRange && column !== undefined && column in selectedRange[row])) || (cellRangeSelectionType === 'Entire Spreadsheet')) {
                  if (cellMatchType === 'Cell Value') {
                      const value = parseFloat(data.value);
                      const lowerBound = parseFloat(matchCellValueRange[0]);
                      const upperBound = parseFloat(matchCellValueRange[1]);
                      if (lowerBound <= value && value <= upperBound) {
                          finalColor = color;
                      }
                  } else if (cellMatchType === 'Specific Text') {
                      if (data.value.includes(matchCellText)) {
                          finalColor = color;
                      }
                  }
              }
          });
      }

      // If no color has been defined via a rule, default cell highlight color is white
      finalColor = finalColor || '#ffffff';
      return finalColor;
  };

  // For number value cell entries, align content to the right to indicate to the user, it is a number value similar to known spreadsheet application features
  evaulateCellValueAlignment = (e) => {
      const {
          data
      } = this.props;
      if (data && data.value && (!isNaN(data.value) || data.value.startsWith('='))) {
          return 'right';
      }
      return 'left';
  };

  componentDidUpdate (prevProps) {
      const {
          row,
          column,
          active,
          selected,
          mode,
          setCellDimensions
      } = this.props;
      if (selected && this.root) {
          setCellDimensions({ row, column }, getOffsetRect(this.root));
      }
      if (this.root && active && mode === 'view' && document.getElementsByClassName('SpreadsheetPopover').length === 0) {
          this.root.focus();
      }
  }

  render () {
      const { row, column, getValue, formulaParser, className } = this.props;
      let { DataViewer, data } = this.props;
      if (data && data.DataViewer) {
          ({ DataViewer, ...data } = data);
      }

      return (
          <td
              ref={this.handleRoot}
              className={classnames({
                  readonly: data && data.readOnly
              }, className
              )}
              data-testid = {'c' + row + column}
              onMouseOver={(e) => { try { this.handleMouseOver(e); } catch (err) { console.log(err); } }}
              onMouseDown={(e) => { try { this.handleMouseDown(e); } catch (err) { console.log(err); } }}
              onDoubleClick={(e) => { try { this.handleDoubleClick(e); } catch (err) { console.log(err); } }}
              tabIndex={0}
              style={this.getCellStyle()}
          >
              <DataViewer
                  row={row}
                  column={column}
                  cell={data}
                  getValue={getValue}
                  formulaParser={formulaParser}
              />
          </td>
      );
  }
}

function mapStateToProps (
    {
        data,
        active,
        selected,
        copied,
        hasPasted,
        mode,
        dragging,
        lastChanged,
        bindings
    },
    { column, row }
) {
    const point = { row, column };
    const cellIsActive = isActive(active, point);

    const cellBindings = PointMap.get(point, bindings);

    return {
        active: cellIsActive,
        selected: PointSet.has(selected, point),
        copied: PointMap.has(point, copied),
        mode: cellIsActive ? mode : 'view',
        data: Matrix.get(row, column, data),
        dragging,
        /** @todo refactor */
        _bindingChanged:
      cellBindings && lastChanged && PointSet.has(cellBindings, lastChanged)
          ? {}
          : null
    };
}

export const enhance = connect(
    mapStateToProps,
    () => ({
        select: Actions.select,
        activate: Actions.activate,
        setCellDimensions: Actions.setCellDimensions
    })
);
