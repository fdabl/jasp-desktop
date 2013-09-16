#include "listmodelvariablesavailable.h"

#include "column.h"

#include <QDebug>

ListModelVariablesAvailable::ListModelVariablesAvailable(QObject *parent)
	: ListModelVariables(parent)
{
}

void ListModelVariablesAvailable::setVariables(const QList<ColumnInfo> &variables)
{
	if (variableTypesAllowed() == (Column::ColumnTypeOrdinal | Column::ColumnTypeNominal | Column::ColumnTypeScale))
	{
		_variables = variables;
		_allVariables = variables;
		return;
	}

	QList<ColumnInfo> allowed;
	QList<ColumnInfo> forbidden;

	foreach (ColumnInfo info, variables)
	{
		if (isForbidden(info.second))
			forbidden.append(info);
		else
			allowed.append(info);
	}

	allowed.append(forbidden);

	_allVariables = allowed;
	_variables = allowed;
}

bool ListModelVariablesAvailable::dropMimeData(const QMimeData *data, Qt::DropAction action, int row, int column, const QModelIndex &parent)
{
	if ( ! canDropMimeData(data, action, row, column, parent))
		return false;

	if (action == Qt::IgnoreAction)
		return true;

	if (ListModelVariables::dropMimeData(data, action, row, column, parent))
	{
		resort();
		return true;
	}

	return false;
}

bool ListModelVariablesAvailable::canDropMimeData(const QMimeData *data, Qt::DropAction action, int row, int column, const QModelIndex &parent) const
{
	if (action == Qt::IgnoreAction)
		return true;

	if (isDroppingToSelf(data))
		return false;

	return ListModelVariables::canDropMimeData(data, action, row, column, parent);
}

void ListModelVariablesAvailable::sendBack(QList<ColumnInfo> &variables)
{
	int insertionPoint = _variables.length();
	insertRows(insertionPoint, variables.length(), QModelIndex());
	for (int i = 0; i < variables.length(); i++)
		_variables[insertionPoint + i] = variables.at(i);

	resort();
	//emit dataChanged(index(insertionPoint, 0), index(insertionPoint + variables.length(), 0));
}

void ListModelVariablesAvailable::resort()
{
	QList<ColumnInfo> sorted;

	foreach (ColumnInfo info, _allVariables)
	{
		if (_variables.contains(info))
			sorted.append(info);
	}

	_variables = sorted;

	emit dataChanged(index(0, 0), index(_variables.length(), 0));
}