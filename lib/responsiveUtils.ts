// @flow

import type {Layout} from "./utils";
import {compact, correctBounds} from "./utils";


/**
 * Given existing layouts and a new breakpoint, find or generate a new layout.
 *
 * This finds the layout above the new one and generates from it, if it exists.
 *
 * @param  {Object} layouts     Existing layouts.
 * @param  {Array} breakpoints All breakpoints.
 * @param  {String} breakpoint New breakpoint.
 * @param  {String} breakpoint Last breakpoint (for fallback).
 * @param  {Number} cols       Column count at new breakpoint.
 * @param  {Boolean} verticalCompact Whether or not to compact the layout
 *   vertically.
 * @return {Array}             New layout.
 */
export function findOrGenerateResponsiveLayout(
  layouts: { [x: string]: any; },
  breakpoints: { [x: string]: number; },
  breakpoint: string,
  lastBreakpoint: string,
  cols: number,
  compactType:any
): Layout {
  // If it already exists, just return it.
  if (layouts[breakpoint]) return layouts[breakpoint];
  // Find or generate the next layout
  let layout = layouts[lastBreakpoint];
  const keys: Array<string> = Object.keys(breakpoints);

  const breakpointsSorted = keys.sort(function (a, b) {
    return breakpoints[a] - breakpoints[b];
  });
  const breakpointsAbove = breakpointsSorted.slice(
    breakpointsSorted.indexOf(breakpoint)
  );
  for (let i = 0, len = breakpointsAbove.length; i < len; i++) {
    const b = breakpointsAbove[i];
    if (layouts[b]) {
      layout = layouts[b];
      break;
    }
  }
  layout = layout || []; // clone layout so we don't modify existing items
  return compact(correctBounds(layout, { cols: cols }), compactType, cols);
}

