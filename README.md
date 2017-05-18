# IIC1103 VJudge Kattis Online

 * [Dependencias](#dependencias)
 * [Uso](#uso)
 * [Añadir un nuevo problema](#añadir-un-nuevo-problema)

---

## Dependencias

### Javascript
  1. [Node.js](https://nodejs.org/en/download/ "Download NodeJS")
  2. [npm](https://github.com/npm/npm "npm github page")

### Python 2
  1. [pip](https://pip.pypa.io/en/stable/installing/ "pip intall ")
  2. python-yaml
   ```
   pip install pyyaml
   ```
  3. python-plastex
  ```
  pip install plasTeX
  ```


## Uso
### Para usar la App, en la línea de comandos:

```
/* Para correr la versión 1, sin VClass */
node app
```
```
/* Para correr la versión 2, con VClass (en construcción) */

node appv2
```


## Añadir un nuevo problema

1. Ir a `kattis-api/kattis-problemtools/problemtools`
1. Crear una carpeta con nombre `<nombre_del_problema>`. La estructura interna incluye 5 carpetas y el archivo problem.yaml.

**Carpetas:**
1. data
1. input_format_validators
1. output_validators
1. problem_statement
1. submissions

**Detalles de cada elemento:**  
1. data: contiene los tests que se van a probar en la carpeta sample y secret. Sample se usa para guardar los test púlbicos y secret, para los privados. Cada test de nombre `<test_name>` debe tener dos archivos asociados que deben estar en la misma ruta (en sample o en secret)
   1. `<test_name>.in` : archivo que guarda el input que se le pasará al programa que se va a probar
   1. `<test_name>.ans` : archivo que guarda el output contra el que se comparará el input, o sea, una respuesta válida.
2. input_format_validator: se usa para revisar que los archivos .in cumplan con los requerimientos.
3. output_format_validator: lo mismo, pero para output.
4. problem_statement: guarda el archivo en latex del enunciado del problema (no implementado correctamente aún)
5. submissions: guarda los programas subidos por los alumnos. TODO: Hacer que se borren cada cierto tiempo y guardar submissions en la base de datos de VClass (Google Drive).

**Configuración de problem.yaml:**
1. `name`: identifica al problema y debe tener el valor `<nombre_del_problema>`
2. `limits`: sirve para especificar los siguientes valores
   1. `time_for_AC_submissions: 3` => Esto indica que los programas tendrán un límite de 3 segundos
3. grading:
    1. `'on_reject': 'grade'` => Esto indica que la forma de evaluar es con una nota (a pesar de lo que puede sugerir el nombre del atributo)
    2. `'accept_score': 7.0` => Esta es la nota asociada a un test correcto
    3. `'reject_score': 1.0` => Esta es la nota asociada a un test incorrecto 
      

***Ejemplo de un archivo problem.yaml:**
```YAML
# problem.yaml

## At least one of author, source, or rights_owner must be provided.
##
## Author of the problem (default: null)
name: Mult
author: Francesca

## Where the problem was first used (default: null)
source: Kattis
# source_url:

## Who owns the rights to the problem (default: value of author, or
## value of source if no author given).
# rights_owner:

## License (see below for list of possible values)
license: educational

## Some keywords describing the problem (default: empty)
# keywords:

# Indicate that we use a custom output validator instead of the
# default token-based diff.
validation: custom
#  validator_flags: float_tolerance 1e-4

# Override standard limits: say that the TLE solutions provided should
# be at least 4 times above the time limit in order for us to be
# happy.
limits:
#  time_multiplier: 5
  time_safety_margin: 4           # (default is 2)
  memory: 1024                   # MB
#  output: 8                      # MB
#  compilation_time: 60           # seconds
#  validation_time: 60            # seconds
  validation_memory: 1024        # MB
#  validation_output: 8           # MB

# Override default grading
grading:
  on_reject: grade
  accept_score: 7.0
  reject_score: 1.0
  objective: max
#  range: -inf +inf

############################################################################
# POSSIBLE VALUES FOR LICENSE:
#
# "unknown"				The default value. In practice means that the
#               		problem can not be used.
# "public domain"		There are no known copyrights on the problem,
# 		   				anywhere in the world.
#						http://creativecommons.org/about/pdm
# "cc0" 				CC0, "no rights reserved"
# 						http://creativecommons.org/about/cc0
# "cc by"				CC attribution
# 	  					http://creativecommons.org/licenses/by/3.0/
# "cc by-sa"			CC attribution, share alike
# 	  					http://creativecommons.org/licenses/by-sa/3.0/
# "educational"			May be freely used for educational purposes
# "permission" 			Used with permission. The author must be contacted
# 						for every additional use.
############################################################################


############################################################################
# OUTPUT VALIDATOR OPTIONS
#
# There is a relatively versatile default validator available that is
# sufficient for most problems.  If the problem needs a custom output
# validator, the validation field should be set to "custom".  The
# validator_flags field is just a list of command line arguments that
# are passed on to the validator program used (whether it be the
# default validator or a custom validator).
############################################################################


############################################################################
# DESCRIPTION OF DEFAULT VALIDATOR OPTIONS
#
# The default validator is essentially a beefed-up diff. In its default
# mode, it tokenizes the two files and compares token by token. It
# supports the following command-line arguments to control how tokens
# are compared.
#
#  o case_sensitive
#       indicates that comparisons should be case-sensitive
#  o space_change_sensitive
#       indicates that changes in the amount of whitespace should
#       be rejected (the de- fault is that any sequence of 1 or more
#       whitespace characters are equivalent).
#  o float_relative_tolerance eps
#       indicates that floating-point tokens should be accepted if
#       they are within relative error <= eps
#  o float_absolute_tolerance eps
#       indicates that floating-point tokens should be accepted if
#       they are within absolute error <= eps
#  o float_tolerance eps
#       short-hand for applying eps as both relative and absolute
#       tolerance.
#
# Note that when supplying both a relative and an absolute tolerance,
# the semantics are that a token is accepted if it is within either of
# the two tolerances.
#
# When a floating-point tolerance has been set, any valid formatting
# of floating point numbers is accepted for floating point tokens. So
# for instance if a token in the answer file says 0.0314, a token of
# 3.14000000e-2 in the output file would be accepted (but note that
# this applies *only* to floating point tokens, so "2.0e2" would *not*
# be a correct output if the answer file says "200"). If no floating
# point tolerance has been set, floating point tokens are treated just
# like any other token and has to match exactly.
############################################################################
```
