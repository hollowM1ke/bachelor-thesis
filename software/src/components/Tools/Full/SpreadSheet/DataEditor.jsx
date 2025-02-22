import React, { Component } from 'react';
import { moveCursorToEnd } from './util';
export default class DataEditor extends Component {
  static defaultProps = {
      value: ''
  };

  handleChange = (e) => {
      const { onChange, cell } = this.props;
      onChange({ ...cell, value: e.target.value });
  };

  handleInput = (input) => {
      this.input = input;
  };

  componentDidMount () {
      if (this.input) {
          moveCursorToEnd(this.input);
      }
  }

  render () {
      const { getValue, column, row, cell } = this.props;
      const value = getValue({ column, row, data: cell }) || '';
      return (
          <div className="DataEditor">
              <input
                  data-testid={'activeEditCell'}
                  ref={this.handleInput}
                  type="text"
                  onChange={(e) => { try { this.handleChange(e); } catch (err) { console.log(err); } }}
                  value={value}
                  autoFocus
              />
          </div>
      );
  }
}
