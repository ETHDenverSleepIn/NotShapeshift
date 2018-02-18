import React, { PropTypes } from 'react';
import MaterialDialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

export default function Dialog(Form, { Component = MaterialDialog } = {}) {
  return class extends Form {
    static propTypes = {
      ...Form.propTypes,
      open: PropTypes.bool,
      title: PropTypes.string,
      saveLabel: PropTypes.string,
      closeLabel: PropTypes.string,
      onRequestClose: PropTypes.func
    };

    static defaultProps = {
      ...Form.defaultProps,
      title: '',
      saveLabel: 'Save',
      closeLabel: 'Cancel',
      open: false
    };

    componentWillReceiveProps(nextProps) {
      if (nextProps.open && !this.props.open) {
        this._nextErrors = {};
      }

      super.componentWillReceiveProps(...arguments);
    }

    getTitle() {
      return this.props.title;
    }

    getActions() {
      const { actions, saveLabel, closeLabel, onRequestClose } = this.props;

      return actions || [
        <FlatButton label={closeLabel} onTouchTap={onRequestClose} />,
        <FlatButton label={saveLabel} primary onTouchTap={() => this.save()} />
      ];
    }

    render() {
      return (
        <Component
          {...this.props}
          title={this.getTitle()}
          actions={this.getActions()}
        >
          {super.render()}
        </Component>
      );
    }
  };
}
