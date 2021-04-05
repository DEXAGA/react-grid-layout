import React from 'react';
import "../css/styles.css";
import "../css/example-styles.css";
import NoDraggingLayout from "./2-no-dragging";

export default {
  title: 'Example/NoDraggingLayout',
  Component: NoDraggingLayout,
};

const Template = (args) => <NoDraggingLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};

