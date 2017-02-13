"""
Implementation of programs provided by an executable file.
"""
import os
from .program import Program
from .errors import ProgramError

class Executable(Program):
    """Class for executable files.
    """
    def __init__(self, path, args=None):
        """Instantiate executable object.

        Args:
            path (str): path to the executable file.  Must be a file,
                and must be executable.
            args: list of additional command line arguments that
                should be passed to the program every time it is executed.
        """
        if not os.path.isfile(path) or not os.access(path, os.X_OK):
            raise ProgramError('%s is not an executable program' % path)
        self.path = path
        self.args = args if args is not None else []

    def __str__(self):
        """String representation"""
        return '%s' % (self.path)

    def compile(self):
        """Dummy implementation of the compile method -- nothing to check!
        """
        return True

    def get_runcmd(self):
        """Command to run the program.
        """
        return [self.path] + self.args
