import React from 'react';
import "../react-grid-layout/css/styles.css";
import "../react-grid-layout/css/example-styles.css";
import NoDraggingLayout from "./2-no-dragging";

export default {
  title: 'Example/NoDraggingLayout',
  Component: NoDraggingLayout,
};

const Template = (args) => <NoDraggingLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};

