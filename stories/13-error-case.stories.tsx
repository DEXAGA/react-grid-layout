import React from 'react';
import "../css/styles.css";
import "../css/example-styles.css";
import ErrorCaseLayout from "./13-error-case";
export default {
  title: 'Example/ErrorCaseLayout',
  Component: ErrorCaseLayout,
};

const Template = (args) => <ErrorCaseLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
