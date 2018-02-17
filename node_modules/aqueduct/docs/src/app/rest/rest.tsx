import * as React from 'react';
import './rest.scss';

interface IRestProps {

}

export class Rest extends React.Component<IRestProps> {
  public render() {
    return (
      <iframe src='./frames/redoc.html' className='iframe-frame' />
    );
  }
}
