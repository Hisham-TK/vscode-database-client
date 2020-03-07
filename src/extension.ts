"use strict";
import * as vscode from "vscode";
import { QueryUnit } from "./database/QueryUnit";
import { ConnectionNode } from "./model/ConnectionNode";
import { DatabaseNode } from "./model/database/databaseNode";
import { INode } from "./model/INode";
import { TableNode } from "./model/table/tableNode";
import { MySQLTreeDataProvider } from "./provider/MysqlTreeDataProvider";
import { CompletionProvider } from "./provider/CompletionProvider";
import { DatabaseCache } from "./database/DatabaseCache";
import { ColumnNode } from "./model/table/columnNode";
import { SqlViewManager } from "./database/SqlViewManager";
import { ProcedureNode } from "./model/other/Procedure";
import { FunctionNode } from "./model/other/function";
import { TriggerNode } from "./model/other/Trigger";

export function activate(context: vscode.ExtensionContext) {

    DatabaseCache.initCache(context)

    SqlViewManager.initExtesnsionPath(context.extensionPath)

    const sqlFiltertTreeProvider = new MySQLTreeDataProvider(context);
    // vscode.window.registerTreeDataProvider("github.cweijan.mysql.filter", sqlFiltertTreeProvider)
    const sqlTreeProvider = new MySQLTreeDataProvider(context);
    const treeview = vscode.window.createTreeView("github.cweijan.mysql", {
        treeDataProvider: sqlTreeProvider
    })
    treeview.onDidCollapseElement(event => {
        DatabaseCache.storeElementState(event.element, vscode.TreeItemCollapsibleState.Collapsed)
    })
    treeview.onDidExpandElement(event => {
        DatabaseCache.storeElementState(event.element, vscode.TreeItemCollapsibleState.Expanded)
    })

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider('sql', new CompletionProvider(), ' ', '.'),
        vscode.commands.registerCommand("mysql.refresh", (node: INode) => {
            sqlTreeProvider.init()
        }),
        vscode.commands.registerCommand("mysql.addDatabase", (connectionNode: ConnectionNode) => {
            connectionNode.createDatabase(sqlTreeProvider)
        }),
        vscode.commands.registerCommand("mysql.deleteDatabase", (databaseNode: DatabaseNode) => {
            databaseNode.deleteDatatabase(sqlTreeProvider)
        }),
        vscode.commands.registerCommand("mysql.addConnection", () => {
            SqlViewManager.showConnectPage(sqlTreeProvider)
        }),
        vscode.commands.registerCommand("mysql.changeTableName", (tableNode: TableNode) => {
            tableNode.changeTableName(sqlTreeProvider)
        }),
        vscode.commands.registerCommand("mysql.table.truncate", (tableNode: TableNode) => {
            tableNode.truncateTable()
        }),
        vscode.commands.registerCommand("mysql.table.drop", (tableNode: TableNode) => {
            tableNode.dropTable(sqlTreeProvider)
        }),
        vscode.commands.registerCommand("mysql.changeColumnName", (columnNode: ColumnNode) => {
            columnNode.changeColumnName(sqlTreeProvider)
        }),
        vscode.commands.registerCommand("mysql.deleteConnection", (connectionNode: ConnectionNode) => {
            connectionNode.deleteConnection(context, sqlTreeProvider);
        }),
        vscode.commands.registerCommand("mysql.runQuery", () => {
            QueryUnit.runQuery();
        }),
        vscode.commands.registerCommand("mysql.newQuery", (databaseOrConnectionNode: DatabaseNode | ConnectionNode) => {
            databaseOrConnectionNode.newQuery();
        }),
        vscode.commands.registerCommand("mysql.template.sql", (tableNode: TableNode, run: Boolean) => {
            tableNode.selectSqlTemplate(run);
        }),
        vscode.commands.registerCommand("mysql.data.export", (iNode: TableNode | DatabaseNode) => {
            vscode.window.showOpenDialog({ canSelectMany: false, openLabel: "Select export file path", canSelectFiles: false, canSelectFolders: true }).then(folderPath => {
                iNode.backupData(folderPath[0].fsPath)
            })
        }),
        vscode.commands.registerCommand("mysql.template.delete", (tableNode: TableNode) => {
            tableNode.deleteSqlTemplate();
        }),
        vscode.commands.registerCommand("mysql.copy.insert", (tableNode: TableNode) => {
            tableNode.insertSqlTemplate();
        }),
        vscode.commands.registerCommand("mysql.copy.update", (tableNode: TableNode) => {
            tableNode.updateSqlTemplate();
        }),
        vscode.commands.registerCommand("mysql.show.procedure", (procedureNode: ProcedureNode) => {
            procedureNode.showSource();
        }),
        vscode.commands.registerCommand("mysql.show.function", (functionNode: FunctionNode) => {
            functionNode.showSource();
        }),
        vscode.commands.registerCommand("mysql.show.trigger", (triggerNode: TriggerNode) => {
            triggerNode.showSource();
        })
    );

}

export function deactivate() {
}
