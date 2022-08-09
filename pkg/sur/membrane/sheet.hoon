|%
+$  sheet  $:(meta=sheet-meta data=(map address scell))
+$  sheet-meta  $:
  id=@uw
  =path
  title=@t
  tags=(set tag)
  row-meta=(map @ud (set visual))
  column-meta=(map @ud (set visual))
  row-count=@ud
  column-count=@ud
  last-modified=@da
  ==
+$  address  [row-address=@ud column-address=@ud]
+$  tag  @t
+$  scell  [meta=scell-meta data=scell-data]
+$  scell-meta  (set visual)
+$  scell-data  [input=@t output=@t]
+$  visual  $%
  [%bold ?]
  [%italic ?]
  [%underline ?]
  [%monospace ?]
  [%strikethrough ?]
  [%foreground tape]
  [%background tape]
  [%size @ud]
  [%font tape]
  [%height @ud]
  [%width @ud]
  ==
--