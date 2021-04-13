import * as React from 'react';
import ExampleLayout from "./ExampleLayout";

export default {
  title: 'Example/ExampleLayout',
  Component: ExampleLayout,
};

const Template = (args) => <ExampleLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
