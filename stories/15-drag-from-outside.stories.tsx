import React from 'react';
import "../css/styles.css";
import "../css/example-styles.css";
import DragFromOutsideLayout from "./15-drag-from-outside";

export default {
  title: 'Example/DragFromOutsideLayout',
  Component: DragFromOutsideLayout,
};

const Template = (args) => <DragFromOutsideLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
