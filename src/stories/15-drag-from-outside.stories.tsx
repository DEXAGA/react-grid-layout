import React from 'react';
import "../react-grid-layout/css/styles.css";
import "../react-grid-layout/css/example-styles.css";
import DragFromOutsideLayout from "./15-drag-from-outside";

export default {
  title: 'Example/DragFromOutsideLayout',
  Component: DragFromOutsideLayout,
};

const Template = (args) => <DragFromOutsideLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
