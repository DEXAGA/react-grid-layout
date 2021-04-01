import React from 'react';
import "../react-grid-layout/css/styles.css";
import "../react-grid-layout/css/example-styles.css";
import BootstrapStyleLayout from "./17-responsive-bootstrap-style";
export default {
  title: 'Example/BootstrapStyleLayout',
  Component: BootstrapStyleLayout,
};

const Template = (args) => <BootstrapStyleLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
