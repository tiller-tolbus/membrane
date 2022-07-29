import * as React from "react";

// NOTE: all modules imported below may be imported from '@silevis/reactgrid'
import {
  CellTemplate,
  Cell,
  Compatible,
  Uncertain,
  UncertainCompatible,
  isNavigationKey,
  getCellProperty,
  isAlphaNumericKey,
  keyCodes,
  getCharFromKeyCode,
} from "@silevis/reactgrid";

export interface TextCell extends Cell {
  type: "flag";
  text: string;
  placeholder?: string;
  validator?: (text: string) => boolean;
  renderer?: (text: string) => React.ReactNode;
  errorMessage?: string;
  input?: string;
  output?: string;
  isFormula?: boolean;
  customStyles?: {
    backgroundColor?: string;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    fontSize?: number;
    underline?: number;
  };
}

export class ExtendedTextCell implements CellTemplate<TextCell> {
  getCompatibleCell(uncertainCell: Uncertain<TextCell>): Compatible<TextCell> {
    const text = getCellProperty(uncertainCell, "text", "string");
    let placeholder: string | undefined;
    try {
      placeholder = getCellProperty(uncertainCell, "placeholder", "string");
    } catch {
      placeholder = "";
    }
    const value = parseFloat(text); // TODO more advanced parsing for all text based cells
    return { ...uncertainCell, text, value, placeholder };
  }

  update(
    cell: Compatible<TextCell>,
    cellToMerge: UncertainCompatible<TextCell>
  ): Compatible<TextCell> {
    return this.getCompatibleCell({
      ...cell,
      text: cellToMerge.text,
      placeholder: cellToMerge.placeholder,
    });
  }

  handleKeyDown(
    cell: Compatible<TextCell>,
    keyCode: number,
    ctrl: boolean,
    shift: boolean,
    alt: boolean
  ): { cell: Compatible<TextCell>; enableEditMode: boolean } {
    const char = getCharFromKeyCode(keyCode, shift);
    if (
      !ctrl &&
      !alt &&
      isAlphaNumericKey(keyCode) &&
      !(shift && keyCode === keyCodes.SPACE)
    )
      return {
        cell: this.getCompatibleCell({
          ...cell,
          text: shift ? char : char.toLowerCase(),
        }),
        enableEditMode: true,
      };
    return {
      cell,
      enableEditMode:
        keyCode === keyCodes.POINTER || keyCode === keyCodes.ENTER,
    };
  }

  getClassName(cell: Compatible<TextCell>, isInEditMode: boolean): string {
    const isValid = cell.validator ? cell.validator(cell.text) : true;
    const className = cell.className ? cell.className : "";
    return `${isValid ? "valid" : "invalid"} ${
      cell.placeholder && cell.text === "" ? "placeholder" : ""
    } ${className}`;
  }

  render(
    cell: Compatible<TextCell>,
    isInEditMode: boolean,
    onCellChanged: (cell: Compatible<TextCell>, commit: boolean) => void
  ): React.ReactNode {
    //TODO: improve customStyles so we just pass the obj, no if/else
    const customStyles = cell.customStyles;
    //todo: manage these styles better
    //todo: add user input for these
    if (!isInEditMode) {
      const cellText = cell.output || cell.text; //move to output entirely

      return (
        <div
          style={{
            ...customStyles,
            position: "absolute",
            width: "100%",
            height: "100%",
            left: 0,
            top: 0,
            display: "flex",
            alignItems: "center",
            fontWeight: customStyles?.bold ? "bold" : "normal",
            fontStyle: customStyles?.italic ? "italic" : "normal",
            textDecoration:
              "" +
              (customStyles?.strikethrough ? "line-through" : "") +
              (customStyles?.underline ? " underline" : ""),
          }}
        >
          <p style={{ margin: 0, padding: 0, paddingLeft: 2 }}>{cellText}</p>
        </div>
      );
    }
    return (
      <input
        spellCheck="false"
        style={{
          ...customStyles,
          fontWeight: customStyles?.bold ? "bold" : "auto",
          fontStyle: customStyles?.italic ? "italic" : "normal",
          textDecoration: customStyles?.strikethrough ? "line-through" : "auto",
        }}
        ref={(input) => {
          if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
          }
        }}
        defaultValue={cell.isFormula ? cell.input : cell.text}
        onChange={(e) =>
          //todo: find out what this does??
          onCellChanged(
            this.getCompatibleCell({ ...cell, text: e.currentTarget.value }),
            false
          )
        }
        onBlur={(e) =>
          onCellChanged(
            this.getCompatibleCell({ ...cell, text: e.currentTarget.value }),
            (e as any).view?.event?.keyCode !== keyCodes.ESCAPE
          )
        }
        onCopy={(e) => e.stopPropagation()}
        onCut={(e) => e.stopPropagation()}
        onPaste={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        //placeholder={cell.placeholder}
        onKeyDown={(e) => {
          if (isAlphaNumericKey(e.keyCode) || isNavigationKey(e.keyCode))
            e.stopPropagation();
        }}
      />
    );
  }
}
