firestarter
===========

## Installation

	Command Shell:
    npm install firestarter
    
    add a NON-PRIVILEGED USER called nodeserver (this user is switched to on execution)
    
    In app:
    require fs=require('firestarter');
    
    When executing:
    sudo node {app}
    


## ** NOTE - INSTALLING THIS DOES NOT REALLY DO ANYTHING (YET!) **
The code is useful to see how to spawn, and communicate with child processes 

## Description

NodeJS client application spawner (with enhanced logging)

Development project, designed for Linux distributions, that starts node projects (as a none privileged user [nodeserver], and using the [nogroup] group.

This tool uses the spawn functionality (similar to cluster), allowing a process per cpu, and implements messaging to shutdown the client, and bring up a new client on death of the child.

Also included, and can be used stand-alone, is the setLoggin.js file, which updates the standard console.log() function(s) to provide more detail, and more control over logging levels.

A work in progress ;-)

### Contributors 

Dave Williamson (davewilliamson)