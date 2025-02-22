import React, { Component } from 'react';
import shallowEqual from 'fbjs/lib/shallowEqual';
import createStore from 'unistore';
import devtools from 'unistore/devtools';
import { Provider } from 'unistore/react';
import * as PointSet from './point-set';
import * as PointMap from './point-map';
import Spreadsheet from './Spreadsheet';
export { createEmptyMatrix } from './util';

const initialState = {
    selected: PointSet.from([]),
    copied: PointMap.from([]),
    active: null,
    mode: 'view',
    rowDimensions: {},
    columnDimensions: {},
    lastChanged: null,
    bindings: PointMap.from([])
};

export default class SpreadsheetStateProvider extends Component {
  store;
  unsubscribe;
  prevState;

  static defaultProps = {
      onChange: () => {},
      onModeChange: () => {},
      onSelect: () => {},
      onActivate: () => {},
      onCellCommit: () => {}
  };

  constructor (props) {
      super(props);
      const state = {
          ...initialState,
          data: this.props.data
      };
      this.store =
      process.env.NODE_ENV === 'production'
          ? createStore(state)
          : devtools(createStore(state));
      this.prevState = state;
  }

  shouldComponentUpdate (nextProps) {
      const { data, ...rest } = this.props;
      const { data: nextData, ...nextRest } = nextProps;
      return !shallowEqual(rest, nextRest) || nextData !== this.prevState.data;
  }

  componentDidMount () {
      const {
          onChange,
          onModeChange,
          onSelect,
          onActivate,
          onCellCommit
      } = this.props;
      this.unsubscribe = this.store.subscribe(
          (state) => {
              const { prevState } = this;

              if (state.lastCommit && state.lastCommit !== prevState.lastCommit) {
                  onCellCommit(state);
              }

              if (state.data !== prevState.data && state.data !== this.props.data) {
                  onChange(state.data);
              }
              if (state.mode !== prevState.mode) {
                  onModeChange(state.mode);
              }
              if (state.selected !== prevState.selected) {
                  onSelect(PointSet.toArray(state.selected));
              }
              if (state.active !== prevState.active && state.active) {
                  onActivate(state.active);
              }
              this.prevState = state;
          }
      );
  }

  componentDidUpdate (prevProps) {
      if (this.props.data !== this.prevState.data) {
          const newData = this.props.data.map(arr => [...arr]);
          if (this.prevState.mode === 'edit' && this.prevState.activeData && this.prevState.lastChanged) {
              const row = this.prevState.lastChanged.row;
              const column = this.prevState.lastChanged.column;
              const value = this.prevState.activeData;
              newData[row][column] = value;
          }
          this.store.setState({
              data: newData
          });
      }
  }

  componentWillUnmount () {
      this.unsubscribe();
  }

  render () {
      const { data, ...rest } = this.props;
      return (
          <Provider store={this.store}>
              <Spreadsheet {...rest} store={this.store} />
          </Provider>
      );
  }
}
