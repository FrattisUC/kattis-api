#! /usr/bin/env python2
# -*- coding: utf-8 -*-
import glob
import string
import hashlib
import collections
import os
import signal
import re
import shutil
import logging
import yaml
import tempfile
import sys
import copy
import random
from argparse import ArgumentParser, ArgumentTypeError
import problem2pdf
import problem2html
import json
import languages
import run

def main():
    j = {"one" : "1", "two" : "2", "three" : "3"}
    jP = json.dumps(j)
    return jP

if __name__ == '__main__':
    main()
