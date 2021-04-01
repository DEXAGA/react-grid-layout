import React from 'react';
import "../react-grid-layout/css/styles.css";
import "../react-grid-layout/css/example-styles.css";
import ResizableHandles from "./17-resizable-handles";
export default {
  title: 'Example/ResizableHandles',
  Component: ResizableHandles,
};

const Template = (args) => <ResizableHandles {...args} />;

export const Example = Template.bind({});
Example.args = {

};
