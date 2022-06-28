|%
+$  sheet  $:(meta=sheet-meta data=(map address scell))
+$  sheet-meta  $:
  id=@uw
  title=path
  owner=@p
  tags=(set tag)
  row-meta=(map @ud (set row-visual))
  column-meta=(map @ud (set column-visual))
  row-count=@ud
  column-count=@ud
  =whitelist
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
  ==
+$  row-visual  $%
  [%base visual]
  [%height @ud]
  ==
+$  column-visual  $%
  [%base visual]
  [%width @ud]
  ==
+$  whitelist  (map @p access)
+$  access  ?(%read %write)
--