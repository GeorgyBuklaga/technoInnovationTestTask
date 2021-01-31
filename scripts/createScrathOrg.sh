#!/bin/sh

while [ ! -n "$ORG_NAME" ]; do
    echo "Please enter a name for your scratch org:"
    read ORG_NAME
done

while [ ! -n "$DEVHUB_NAME" ]; do
    echo "Please enter the Username/Alias of your Devhub:"
    read DEVHUB_NAME
done

echo "Building your org, please wait."
sfdx force:org:create -v ${DEVHUB_NAME} -a ${ORG_NAME} -f config/project-scratch-def.json -n -d 30 --json

if [ "$?" = "1" ]; then
    echo "Can't create your org."
    exit
fi

echo "Scratch org created."
echo "Pushing the code, please wait. It may take a while."

sfdx force:source:deploy -u ${ORG_NAME} -p force-app/main/default -o

if [ "$?" = "1" ]; then
    echo "Can't push your source."
    exit
fi

echo "Code is pushed successfully."

sfdx force:user:permset:assign -n Test_Task_Permission -u ${ORG_NAME}

echo "You will find the link to open your org below."
sfdx force:org:open -u ${ORG_NAME} -r
