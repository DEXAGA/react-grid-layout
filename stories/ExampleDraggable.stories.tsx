import * as React from 'react';
import ExampleDraggable from "./ExampleDraggable";

export default {
  title: 'Example/App',
  Component: ExampleDraggable,
};

const Template = (args) => <ExampleDraggable {...args} />;

export const Example = Template.bind({});
Example.args = {

};
